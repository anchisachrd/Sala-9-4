import { supabase } from './supabaseClient'

export async function fetchNotes(entryId) {
  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, content, created_at')
    .eq('watch_entry_id', entryId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addNote(entryId, userId, content) {
  const { error } = await supabase
    .from('notes')
    .insert({ watch_entry_id: entryId, user_id: userId, content })
  if (error) throw error
}

// Live-updates both sides while the panel is open, via Supabase Realtime.
export function subscribeToNotes(entryId, onInsert) {
  const channel = supabase
    .channel(`notes:${entryId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
        filter: `watch_entry_id=eq.${entryId}`,
      },
      (payload) => onInsert(payload.new),
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
