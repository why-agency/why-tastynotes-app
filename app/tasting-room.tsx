'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

import { Canvas } from '@react-three/fiber'
import Confetti from './confetti'

interface TastingNote {
  id: number
  title: string
  created_at: string
  created_by: string
  note: string
}
const supabase = createClient()

export default function TastingRoom({
  serverTastingNotes
}: {
  serverTastingNotes: TastingNote[]
}) {
  const [isConfettiActive, setIsConfettiActive] = useState(false)

  const [tastingNotes, setTastingNotes] =
    useState<TastingNote[]>(serverTastingNotes)

  useEffect(() => {
    const channelNotes = supabase
      .channel('realtime-tasting-notes')
      .on(
        'postgres_changes',
        {
          event: '*',
          table: 'tasting_notes',
          schema: 'public'
        },
        payload => {
          console.log('channelNotes payload', payload, tastingNotes)
          setIsConfettiActive(true)
          setTimeout(() => {
            setIsConfettiActive(false)
          }, 15000)
          return setTastingNotes(
            tastingNotes.concat(payload.new as TastingNote)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelNotes)
    }
  }, [supabase, tastingNotes, setTastingNotes])

  const getCardColors = (index: number) => {
    const colors = [
      'bg-background-dark-soil bg-background-light-rose text-foreground-light',
      'bg-background-earthy-grape bg-background-sunny-rose text-foreground-dark',
      'bg-background-earthy-green bg-background-vibrant-pink text-foreground-light',
      'bg-background-light-rose bg-background-earthy-grape text-foreground-light',
      'bg-background-earthy-grape bg-background-sunny-rose text-foreground-light',
      'bg-background-earthy-green bg-background-dark-soil text-foreground-light',
      'bg-background-dark-soil bg-background-earthy-green text-foreground-light',
      'bg-background-earthy-grape bg-background-light-rose text-foreground-light',
      'bg-background-vibrant-pink bg-background-earthy-green text-foreground-light'
    ]

    return colors[index % colors.length].split(' ')
  }

  if (!tastingNotes || !tastingNotes.length)
    return (
      <div className="absolute w-52 flex flex-col inset-x-[calc(50%-80px)] top-[calc(50%+64px)] text-background-sunny-rose">
        <h1 className="text-[32px] font-secondary font-light">No notes yet!</h1>
        <Link href="/create-note" className="hover:underline">
          Be the first to add a note.
        </Link>
      </div>
    )

  return (
    <>
      {isConfettiActive && (
        <Canvas
          style={{ position: 'fixed' }}
          className="fixed inset-0 w-full h-full pointer-events-none z-10 bg-transparent"
        >
          {/* @ts-ignore */}
          <Confetti isExploding position={[0, 0, 3]} />
        </Canvas>
      )}
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full">
        {tastingNotes.map((tastingNote, index) => {
          const [background, foreground, text] = getCardColors(index)
          return (
            <li
              key={tastingNote.id}
              className={`flex justify-center items-center w-full min-h-[480px] 2xl:min-h-[600px] ${background} ${text}`}
            >
              <div
                className={`w-[240px] h-[255px] xl:w-[280px] xl:h-[288px] 2xl:w-[320px] 2xl:h-[364px] rounded-xl p-6 shadow-2xl ${foreground} flex flex-col justify-between`}
              >
                <div>
                  <h2 className="text-[32px] font-secondary font-light">
                    {tastingNote.title}
                  </h2>
                  <p className="text-sm text-[15px] opacity-80">
                    Tasted by {tastingNote.created_by}
                  </p>
                </div>
                <p className="text-sm text-[15px] opacity-80 line-clamp-2 2xl:line-clamp-4">
                  {tastingNote.note}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
