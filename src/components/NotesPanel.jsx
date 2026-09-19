import { useState } from 'react'
import { SendIcon, CloseIcon } from './icons'
import { useNotes } from '../hooks/useNotes'
import { useAuth } from '../context/AuthContext'
import { personBubbleClass } from '../utils/personColors'

function NoteBubble({ note, displayName, isOwn }) {
  const initial = displayName?.[0]?.toUpperCase() ?? '?'
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl px-3 py-2 ${personBubbleClass(displayName)}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-4 h-4 rounded-full bg-white/30 grid place-items-center text-[9px] text-white shrink-0">
            {initial}
          </span>
          <span className="text-[11px] font-medium text-white/90">{displayName}</span>
        </div>
        <p className="text-xs text-white leading-snug">{note.content}</p>
      </div>
    </div>
  )
}

export default function NotesPanel({ entryId, title, profiles, onClose }) {
  const { user } = useAuth()
  const { notes, loading, send } = useNotes(entryId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    try {
      await send(user.id, draft.trim())
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-96 h-full bg-white shadow-xl flex flex-col font-pangolin animate-slide-in-right"
      >
        <div className="relative flex flex-col items-center gap-1 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon size={18} />
          </button>
          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Post-Credit
          </span>
          <h4 className="text-sm text-[#474747]">{title}</h4>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 p-4">
          {loading ? (
            <p className="text-xs text-gray-400 text-center">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <NoteBubble
                key={note.id}
                note={note}
                displayName={nameById[note.user_id] ?? 'Unknown'}
                isOwn={note.user_id === user.id}
              />
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-3 border-t border-gray-100 shrink-0"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a note…"
            className="flex-1 min-w-0 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-[#474747] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="grid place-items-center w-8 h-8 rounded-full bg-brand text-white disabled:opacity-40 shrink-0"
          >
            <SendIcon size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
