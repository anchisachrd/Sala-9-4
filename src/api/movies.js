import { supabase } from './supabaseClient'
import { tmdbPosterUrl } from './tmdb'

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .order('display_name')
  if (error) throw error
  return data ?? []
}

// Cache a TMDB movie into `movies` (idempotent on tmdb_id), return the row.
async function upsertMovie(tmdb) {
  const { data, error } = await supabase
    .from('movies')
    .upsert(
      {
        tmdb_id: tmdb.tmdbId,
        title: tmdb.title,
        poster_url: tmdbPosterUrl(tmdb.posterPath) || null,
        release_year: tmdb.year ?? null,
        genre: (tmdb.genres ?? []).join(', ') || null,
        runtime_minutes: tmdb.runtimeMinutes ?? null,
      },
      { onConflict: 'tmdb_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function bookmarkMovie(tmdb) {
  const movie = await upsertMovie(tmdb)
  const { error } = await supabase
    .from('watch_entries')
    .insert({ movie_id: movie.id, status: 'waiting' })
  if (error) throw error
}

export async function removeEntry(entryId) {
  const { error } = await supabase.from('watch_entries').delete().eq('id', entryId)
  if (error) throw error
}

// scores: { [profileId]: number }
async function saveRatings(entryId, scores) {
  const rows = Object.entries(scores)
    .filter(([, score]) => score !== '' && score != null)
    .map(([user_id, score]) => ({
      watch_entry_id: entryId,
      user_id,
      score: Number(score),
    }))
  if (rows.length) {
    const { error } = await supabase
      .from('ratings')
      .upsert(rows, { onConflict: 'watch_entry_id,user_id' })
    if (error) throw error
  }
}

// existingEntryId = promote a waiting entry to completed instead of creating a new one.
export async function completeMovie(tmdb, { watchedDate, scores, existingEntryId }) {
  const movie = await upsertMovie(tmdb)

  let entryId = existingEntryId
  if (entryId) {
    const { error } = await supabase
      .from('watch_entries')
      .update({ status: 'completed', watched_date: watchedDate })
      .eq('id', entryId)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('watch_entries')
      .insert({ movie_id: movie.id, status: 'completed', watched_date: watchedDate })
      .select('id')
      .single()
    if (error) throw error
    entryId = data.id
  }

  await saveRatings(entryId, scores)
}

// Editing an already-completed entry only ever touches score + watched date.
// Pass status: 'completed' to also promote a waiting entry via the same modal.
export async function updateWatchEntry(entryId, { watchedDate, scores, status }) {
  const { error } = await supabase
    .from('watch_entries')
    .update(status ? { watched_date: watchedDate, status } : { watched_date: watchedDate })
    .eq('id', entryId)
  if (error) throw error

  await saveRatings(entryId, scores)
}

// One watch_entry -> one card. Joins movie data, per-person ratings, note count.
export async function fetchMovies() {
  const { data, error } = await supabase
    .from('watch_entries')
    .select(
      `
      id,
      status,
      watched_date,
      created_at,
      movies ( tmdb_id, title, poster_url, release_year, genre, runtime_minutes ),
      ratings ( score, profiles ( display_name ) ),
      notes ( count )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((entry) => ({
    id: entry.id,
    tmdbId: entry.movies?.tmdb_id,
    title: entry.movies?.title ?? 'Untitled',
    genre: entry.movies?.genre ?? '',
    runtimeMinutes: entry.movies?.runtime_minutes ?? 0,
    posterUrl: entry.movies?.poster_url ?? '',
    releaseYear: entry.movies?.release_year ?? null,
    status: entry.status,
    watchedDate: entry.watched_date,
    createdAt: entry.created_at,
    scores: Object.fromEntries(
      (entry.ratings ?? [])
        .filter((r) => r.profiles?.display_name != null)
        .map((r) => [r.profiles.display_name, r.score]),
    ),
    notesCount: entry.notes?.[0]?.count ?? 0,
  }))
}
