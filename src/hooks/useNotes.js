import { useEffect, useState } from 'react'
import { fetchNotes, addNote, subscribeToNotes } from '../api/notes'

export function useNotes(entryId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!entryId) return
    let cancelled = false

    setLoading(true)
    fetchNotes(entryId).then((data) => {
      if (cancelled) return
      setNotes(data)
      setLoading(false)
    })

    const unsubscribe = subscribeToNotes(entryId, (note) => {
      setNotes((prev) => (prev.some((n) => n.id === note.id) ? prev : [...prev, note]))
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [entryId])

  const send = (userId, content) => addNote(entryId, userId, content)

  return { notes, loading, send }
}
