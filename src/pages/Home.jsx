import { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from '../components/icons'
import MovieCard from '../components/MovieCard'
import CompleteModal from '../components/CompleteModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import NotesPanel from '../components/NotesPanel'
import { useMovies } from '../hooks/useMovies'
import { averageScore } from '../utils/format'
import { fetchProfiles, updateWatchEntry, removeEntry } from '../api/movies'

const TABS = [
  { key: 'all', label: 'All movies' },
  { key: 'completed', label: 'Completed' },
  { key: 'waiting', label: 'Waiting' },
]

const SORT_OPTIONS = {
  all: ['Recently watched', 'Title', 'Score'],
  completed: ['Recently watched', 'Title', 'Score'],
  waiting: ['Recently added', 'Title'],
}

function StatCard({ label, value, className }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col justify-between min-h-32 ${className}`}>
      <span className="font-paprika text-xl text-white">{label}</span>
      <span className="text-4xl font-pangolin text-white text-right">{value}</span>
    </div>
  )
}

function TimeBox({ value, unit }) {
  return (
    <div className="bg-[#EBE3C7]/92 px-8 py-4 flex flex-col items-center min-w-16">
      <span className="text-xl font-pangolin text-black/70">{value}</span>
      <span className="text-xs text-black/70">{unit}</span>
    </div>
  )
}

export default function Home() {
  const { movies, loading, error, reload } = useMovies()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS.all[0])
  const [profiles, setProfiles] = useState([])
  const [modal, setModal] = useState(null) // { movie, mode: 'edit' | 'complete' }
  const [deleting, setDeleting] = useState(null) // movie pending delete confirmation
  const [notesOpenId, setNotesOpenId] = useState(null) // movie.id whose notes panel is open

  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(() => {})
  }, [])

  const notesMovie = movies.find((m) => m.id === notesOpenId) ?? null

  const completed = movies.filter((m) => m.status === 'completed')
  const waiting = movies.filter((m) => m.status === 'waiting')
  const totalMinutes = completed.reduce((sum, m) => sum + m.runtimeMinutes, 0)
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  const handleTab = (key) => {
    setTab(key)
    setSort(SORT_OPTIONS[key][0])
  }

  const visible = useMemo(() => {
    let list = movies
    if (tab !== 'all') list = list.filter((m) => m.status === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((m) => m.title.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sort === 'Title') return a.title.localeCompare(b.title)
      if (sort === 'Score') return averageScore(b.scores) - averageScore(a.scores)
      if (sort === 'Recently watched')
        return (b.watchedDate ?? '').localeCompare(a.watchedDate ?? '')
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '') // Recently added
    })
  }, [movies, tab, search, sort])

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr] gap-4">
        <StatCard label="Sesiones" value={completed.length} className="bg-brand text-lg" />
        <div className="rounded-2xl p-6 bg-sand flex flex-col gap-4 min-h-32 justify-center items-center">
          <span className="font-paprika text-xl text-center text-white">Total Hours</span>
          <div className="flex gap-5 justify-center">
            <TimeBox value={hrs} unit="hrs" />
            <TimeBox value={mins} unit="mins" />
            <TimeBox value={0} unit="secs" />
          </div>
        </div>
        <StatCard label="Pendientes" value={waiting.length} className="bg-sage text-lg" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`pb-1 text-lg transition-colors font-pangolin ${
                tab === t.key
                  ? 'text-[#7982A2] border-b-3 border-[#F0DFA6]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-40">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md bg-white pl-9 pr-3 py-2 text-sm text-[#474747] font-pangolin placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
          />
        </div>

        <label className="flex items-center gap-2 font-pangolin text-sm text-gray-500">
          Sort by:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-md bg-white px-2 py-2 text-sm text-[#474747]"
          >
            {SORT_OPTIONS[tab].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center font-pangolin mt-8">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-500 text-center font-pangolin mt-8">
          Couldn’t load movies: {error.message}
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-400 text-center font-pangolin mt-8">No movies yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={() => setModal({ movie, mode: 'edit' })}
              onComplete={() => setModal({ movie, mode: 'complete' })}
              onDelete={() => setDeleting(movie)}
              onOpenNotes={() =>
                setNotesOpenId((id) => (id === movie.id ? null : movie.id))
              }
            />
          ))}
        </div>
      )}

      {notesMovie && (
        <NotesPanel
          entryId={notesMovie.id}
          title={notesMovie.title}
          profiles={profiles}
          onClose={() => setNotesOpenId(null)}
        />
      )}

      {modal && (
        <CompleteModal
          movie={{
            title: modal.movie.title,
            posterUrl: modal.movie.posterUrl,
            year: modal.movie.releaseYear,
            runtimeMinutes: modal.movie.runtimeMinutes,
            genres: modal.movie.genre ? modal.movie.genre.split(', ') : [],
          }}
          profiles={profiles}
          initial={{
            watchedDate: modal.movie.watchedDate,
            scores: Object.fromEntries(
              profiles.map((p) => [p.id, modal.movie.scores[p.display_name] ?? '']),
            ),
          }}
          onSubmit={({ watchedDate, scores }) =>
            updateWatchEntry(modal.movie.id, {
              watchedDate,
              scores,
              status: modal.mode === 'complete' ? 'completed' : undefined,
            }).then(reload)
          }
          onClose={() => setModal(null)}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={deleting.title}
          onConfirm={() => removeEntry(deleting.id).then(reload)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
