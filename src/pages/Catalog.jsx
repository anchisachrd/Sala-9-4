import { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from '../components/icons'
import ResultCard from '../components/ResultCard'
import CompleteModal from '../components/CompleteModal'
import { searchMovies, getMovieDetails, tmdbPosterUrl } from '../api/tmdb'
import {
  fetchProfiles,
  bookmarkMovie,
  removeEntry,
  completeMovie,
} from '../api/movies'
import { useMovies } from '../hooks/useMovies'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

export default function Catalog() {
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 400)

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [profiles, setProfiles] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [completing, setCompleting] = useState(null) // tmdb movie being completed

  const { movies, reload } = useMovies()

  // tmdbId -> { status, entryId } for movies already on the site
  const existing = useMemo(() => {
    const map = new Map()
    for (const m of movies) {
      if (m.tmdbId == null) continue
      const current = map.get(m.tmdbId)
      // completed wins over waiting
      if (!current || m.status === 'completed') {
        map.set(m.tmdbId, { status: m.status, entryId: m.id })
      }
    }
    return map
  }, [movies])

  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(() => {})
  }, [])

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      setError(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    searchMovies(debounced, { signal: controller.signal })
      .then((r) => {
        setResults(r)
        setError(null)
        // Search doesn't include runtime — fetch it per movie and backfill as it arrives.
        r.forEach((movie) => {
          getMovieDetails(movie.tmdbId)
            .then((details) => {
              if (controller.signal.aborted) return
              setResults((prev) =>
                prev.map((m) =>
                  m.tmdbId === movie.tmdbId
                    ? { ...m, runtimeMinutes: details.runtimeMinutes }
                    : m,
                ),
              )
            })
            .catch(() => {})
        })
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [debounced])

  const handleBookmarkToggle = async (movie) => {
    const entry = existing.get(movie.tmdbId)
    setBusyId(movie.tmdbId)
    try {
      if (entry?.status === 'waiting') {
        await removeEntry(entry.entryId)
      } else {
        await bookmarkMovie(await getMovieDetails(movie.tmdbId))
      }
      await reload()
    } catch (err) {
      setError(err)
    } finally {
      setBusyId(null)
    }
  }

  const handleOpenComplete = async (movie) => {
    const details = await getMovieDetails(movie.tmdbId)
    setCompleting({ ...details, posterUrl: tmdbPosterUrl(details.posterPath) })
  }

  const handleCompleteSubmit = async ({ watchedDate, scores }) => {
    const entry = existing.get(completing.tmdbId)
    await completeMovie(completing, {
      watchedDate,
      scores,
      existingEntryId: entry?.status === 'waiting' ? entry.entryId : undefined,
    })
    await reload()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-2xl mx-auto w-full">
        <SearchIcon
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a movie…"
          className="w-full rounded-full bg-white px-5 py-3 pr-11 text-[#474747] font-pangolin shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-400 text-center font-pangolin">Searching…</p>
      )}
      {error && (
        <p className="text-sm text-red-500 text-center font-pangolin">
          {error.message}
        </p>
      )}
      {!loading && !error && debounced.trim() && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center font-pangolin">
          No results for “{debounced}”.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {results.map((movie) => (
          <ResultCard
            key={movie.tmdbId}
            movie={movie}
            status={existing.get(movie.tmdbId)?.status ?? null}
            busy={busyId === movie.tmdbId}
            onComplete={() => handleOpenComplete(movie)}
            onBookmarkToggle={() => handleBookmarkToggle(movie)}
          />
        ))}
      </div>

      {completing && (
        <CompleteModal
          movie={completing}
          profiles={profiles}
          onSubmit={handleCompleteSubmit}
          onClose={() => setCompleting(null)}
        />
      )}
    </div>
  )
}
