import { experimental_AssistantResponse } from 'ai'
import OpenAI from 'openai'
import { MessageContentText } from 'openai/resources/beta/threads/messages/messages'
import type { RunSubmitToolOutputsParams } from 'openai/resources/beta/threads/runs/runs'

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.NEXT_OPENAI_API_KEY || ''
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

interface TastingNote {
  title: string
  name: string
  tasting_note: string
}

const createTastingNote = async (data: TastingNote) => {
  try {
    const { data: note, error } = await supabase.from('tasting_notes').insert({
      created_by: data.name,
      title: data.title,
      note: data.tasting_note
    })

    if (error) {
      throw error
    }

    return note
  } catch (error) {
    console.error(error)
    return 'Sorry, we could not save your tasting note.'
  }
}

async function processToolCalls(
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[]> {
  const promises = toolCalls.map(toolCall => {
    return new Promise(async (resolve, reject) => {
      try {
        const parameters = JSON.parse(toolCall.function.arguments)

        switch (toolCall.function.name) {
          case 'createTastingNote': {
            await createTastingNote(parameters)

            resolve({
              tool_call_id: toolCall.id,
              output: parameters.tasting_note
            })
            break
          }
          default:
            reject(
              new Error(`Unknown tool call function: ${toolCall.function.name}`)
            )
        }
      } catch (error) {
        reject(error)
      }
    })
  })

  // @ts-ignore
  return Promise.all(promises)
}

export async function POST(req: Request) {
  // Parse the request body
  const input: {
    threadId: string | null
    message: string
  } = await req.json()

  // Create a thread if needed
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id

  // Add a message to the thread
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message
  })

  return experimental_AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ threadId, sendMessage }) => {
      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id:
          process.env.NEXT_ASSISTANT_ID ??
          (() => {
            throw new Error('ASSISTANT_ID is not set')
          })()
      })

      async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
        // Poll for status change
        while (run.status === 'queued' || run.status === 'in_progress') {
          // delay for 500ms:
          await new Promise(resolve => setTimeout(resolve, 500))

          run = await openai.beta.threads.runs.retrieve(threadId!, run.id)
        }

        // Check the run status
        if (
          run.status === 'cancelled' ||
          run.status === 'cancelling' ||
          run.status === 'failed' ||
          run.status === 'expired'
        ) {
          throw new Error(run.status)
        }

        if (run.status === 'requires_action') {
          if (run.required_action?.type === 'submit_tool_outputs') {
            const tool_outputs = await processToolCalls(
              run.required_action.submit_tool_outputs.tool_calls
            )

            run = await openai.beta.threads.runs.submitToolOutputs(
              threadId!,
              run.id,
              { tool_outputs }
            )

            await waitForRun(run)
          }
        }
      }

      await waitForRun(run)

      // Get new thread messages (after our message)
      const responseMessages = (
        await openai.beta.threads.messages.list(threadId, {
          after: createdMessage.id,
          order: 'asc'
        })
      ).data

      // Send the messages
      for (const message of responseMessages) {
        sendMessage({
          id: message.id,
          role: 'assistant',
          content: message.content.filter(
            content => content.type === 'text'
          ) as Array<MessageContentText>
        })
      }
    }
  )
}
