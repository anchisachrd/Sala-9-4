import { CheckIcon, CompleteIcon, BookmarkIcon } from './icons'
import { tmdbPosterUrl } from '../api/tmdb'

export default function ResultCard({ movie, status, busy, onComplete, onBookmarkToggle }) {
  const meta = [
    movie.year,
    movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : null,
    movie.genres?.length ? movie.genres.join(' · ') : null,
  ]
    .filter(Boolean)
    .join('  |  ')

  return (
    <div className="px-5 pt-5 pb-2 bg-[#FEFAF2] rounded-xl shadow-md/10 overflow-hidden flex flex-col font-pangolin">
      <img
        src={tmdbPosterUrl(movie.posterPath)}
        alt={movie.title}
        className="w-full aspect-[2/3] object-cover bg-gray-100"
      />
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-parkinsans font-semibold text-base text-[#474747] leading-tight">{movie.title}</h3>
        <p className="text-sm text-gray-400 font-parkinsans">{meta}</p>

        <div className="mt-auto pt-2 flex justify-end gap-2">
          {status === 'completed' ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckIcon size={16} /> Added
            </span>
          ) : (
            <>
              <button
                type="button"
                aria-label="Complete"
                disabled={busy}
                onClick={onComplete}
                className="text-gray-400 hover:text-sage disabled:opacity-40"
              >
                <CompleteIcon size={18} />
              </button>
              <button
                type="button"
                aria-label="Bookmark"
                disabled={busy}
                onClick={onBookmarkToggle}
                className={`disabled:opacity-40 ${
                  status === 'waiting'
                    ? 'text-amber-500'
                    : 'text-gray-400 hover:text-amber-500'
                }`}
              >
                <BookmarkIcon
                  size={18}
                  className={status === 'waiting' ? 'fill-amber-500' : ''}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
