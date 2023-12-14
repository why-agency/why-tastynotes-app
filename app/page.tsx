import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import TastingRoom from './tasting-room'
import Logo from './logo'

export default async function Notes() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: notes } = await supabase.from('tasting_notes').select()

  return (
    <>
      <Logo link='/create-note' />
      <TastingRoom serverTastingNotes={notes ?? []} />
    </>
  )
}
