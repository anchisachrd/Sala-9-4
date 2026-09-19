const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'

export const tmdbPosterUrl = (path, size = 'w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : ''

// TMDB's movie genre ids are stable — map locally so search needs no extra call.
const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
}

const genreNames = (ids = []) => ids.map((id) => GENRES[id]).filter(Boolean)

const yearOf = (releaseDate) =>
  releaseDate ? Number(releaseDate.slice(0, 4)) : null

export async function searchMovies(query, { signal } = {}) {
  if (!query.trim()) return []

  const url = `${BASE}/search/movie?api_key=${API_KEY}&include_adult=false&query=${encodeURIComponent(
    query,
  )}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`TMDB search failed (${res.status})`)
  const data = await res.json()
  return (data.results ?? []).map((m) => ({
    tmdbId: m.id,
    title: m.title,
    year: yearOf(m.release_date),
    posterPath: m.poster_path,
    genres: genreNames(m.genre_ids),
    runtimeMinutes: null,
  }))
}

// Search results lack runtime + full genres — fetch on demand when adding a movie.
export async function getMovieDetails(tmdbId) {
  const res = await fetch(`${BASE}/movie/${tmdbId}?api_key=${API_KEY}`)
  if (!res.ok) throw new Error(`TMDB details failed (${res.status})`)
  const m = await res.json()
  return {
    tmdbId: m.id,
    title: m.title,
    year: yearOf(m.release_date),
    posterPath: m.poster_path,
    genres: (m.genres ?? []).map((g) => g.name),
    runtimeMinutes: m.runtime ?? null,
  }
}
