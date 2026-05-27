import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client bypasses RLS — used only after verifying the user is a participant
const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { battleId } = await req.json()
  if (!battleId) return NextResponse.json({ error: 'Missing battleId' }, { status: 400 })

  const { data: character } = await supabase
    .from('characters')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!character) return NextResponse.json({ error: 'No character' }, { status: 400 })

  const { data: battle } = await supabase
    .from('battles')
    .select('id, challenger_id, challenged_id')
    .eq('id', battleId)
    .single()

  if (!battle) return NextResponse.json({ error: 'Battle not found' }, { status: 404 })

  const isChallenger = battle.challenger_id === character.id
  const isChallenged = battle.challenged_id === character.id
  if (!isChallenger && !isChallenged) return NextResponse.json({ error: 'Not a participant' }, { status: 403 })

  const seenField = isChallenger ? 'challenger_seen' : 'challenged_seen'
  const { error } = await supabaseAdmin
    .from('battles')
    .update({ [seenField]: true })
    .eq('id', battleId)

  if (error) {
    console.error('[mark-seen] update failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
