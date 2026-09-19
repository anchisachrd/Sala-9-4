import { useState } from 'react'
import { CloseIcon, CheckIcon } from './icons'
import { personBadgeClass } from '../utils/personColors'
import Stars from './Stars'

const today = () => new Date().toISOString().slice(0, 10)

export default function CompleteModal({ movie, profiles, initial, onSubmit, onClose }) {
  const [watchedDate, setWatchedDate] = useState(initial?.watchedDate ?? today())
  const [scores, setScores] = useState(() =>
    Object.fromEntries(profiles.map((p) => [p.id, initial?.scores?.[p.id] ?? ''])),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const meta = [
    movie.year,
    movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : null,
    movie.genres?.length ? movie.genres.join(' · ') : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({ watchedDate, scores })
      onClose()
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#FAF6EC] rounded-2xl p-4 flex flex-col gap-4 font-pangolin"
      >
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} className="text-[#474747]" />
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm text-[#474747] shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <CheckIcon size={14} />
            {saving ? 'saving…' : 'save'}
          </button>
        </div>

        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover rounded-xl bg-gray-100"
        />

        <div>
          <h2 className="text-xl text-[#474747] leading-tight">{movie.title}</h2>
          {meta && <p className="text-sm text-gray-400 mt-1">{meta}</p>}
        </div>

        <div className="flex flex-col gap-2">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div
                className={`flex items-center rounded-md overflow-hidden ${personBadgeClass(
                  p.display_name,
                )}`}
              >
                <span className="text-sm font-medium pl-2.5 pr-1.5 py-1 w-16">
                  {p.display_name}:
                </span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={scores[p.id]}
                  onChange={(e) => setScores((s) => ({ ...s, [p.id]: e.target.value }))}
                  className="w-14 bg-white px-2 py-1 text-center text-sm text-[#474747] focus:outline-none"
                />
              </div>
              <Stars value={Number(scores[p.id]) || 0} size={16} />
            </div>
          ))}
        </div>

        <label className="flex items-center justify-between gap-3 text-sm text-gray-500">
          watched date
          <input
            type="date"
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
            required
            className="rounded-md bg-white px-3 py-1.5 text-[#474747] shadow-sm"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </div>
  )
}
