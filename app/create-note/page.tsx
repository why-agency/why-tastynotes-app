'use client'

import {
  Message,
  // import as useAssistant:
  experimental_useAssistant as useAssistant
} from 'ai/react'

import Logo from '@/app/logo'

const roleToColorMap: Record<Message['role'], string> = {
  system: 'red',
  user: 'text-background-sunny-rose',
  function: 'blue',
  assistant: 'text-background-sunny-rose',
  data: 'orange'
}

export default function Chat() {
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: '/api/assistant' })

  return (
    <>
      <Logo
        link="/"
        className="fixed z-10 top-0 inset-x-[calc(50%-45px)] scale-50"
      />
      <div className="flex flex-col w-full max-w-md py-24 px-6 mx-auto stretch">
        <div className={`whitespace-pre-wrap ${roleToColorMap['assistant']}`}>
          <strong className="capitalize">{`Assistant: `}</strong>
          Welcome and cheers! Start by describing the color of your wine. For
          example "My wine is a bright, ruby red."
          <br />
          <br />
        </div>
        {messages.map((m: Message) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap ${roleToColorMap[m.role]}`}
          >
            <strong className="capitalize">{`${m.role}: `}</strong>
            {m.role !== 'data' && m.content}
            {m.role === 'data' && JSON.stringify(m)}
            <br />
            <br />
          </div>
        ))}

        {status === 'in_progress' && (
          <div className="text-xl animate-bounce flex justify-center">
            <span>🍷</span>
          </div>
        )}

        <form onSubmit={submitMessage}>
          <input
            disabled={status !== 'awaiting_message'}
            className="fixed bottom-0 w-[calc(100%-48px)] max-w-md p-2 mb-8 bg-background-sunny-rose rounded shadow-xl placeholder:text-foreground-dark/75"
            value={input}
            placeholder="What's the color of your wine?"
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  )
}
