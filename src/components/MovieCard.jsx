import {
  EditIcon,
  DeleteIcon,
  MessageIcon,
  FilmIcon,
  ClockIcon,
  CompleteIcon,
} from './icons'
import { formatWatchedDate } from '../utils/format'
import { personBadgeClass } from '../utils/personColors'
import Stars from './Stars'

function IconButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid place-items-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-gray-100"
    >
      {children}
    </button>
  )
}

export default function MovieCard({ movie, onEdit, onComplete, onDelete, onOpenNotes }) {
  const scores = Object.values(movie.scores)
  const overall = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0
  const isWaiting = movie.status === 'waiting'

  return (
    <div className="relative bg-white rounded-xl p-2 flex flex-col gap-2 shadow-sm font-pangolin">
      <div className="absolute top-3 right-3 flex gap-1">
        <IconButton label="Notes" onClick={onOpenNotes}>
          <MessageIcon size={13} />
        </IconButton>
        <IconButton label="Delete" onClick={onDelete}>
          <DeleteIcon size={13} />
        </IconButton>
        {isWaiting ? (
          <IconButton label="Complete" onClick={onComplete}>
            <CompleteIcon size={13} />
          </IconButton>
        ) : (
          <IconButton label="Edit" onClick={onEdit}>
            <EditIcon size={13} />
          </IconButton>
        )}
      </div>

      <div className="flex gap-3 items-center ">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-35 aspect-[2/3] object-cover rounded-l-xl bg-gray-100 shrink-0 self-stretch"
        />
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 pt-5 ">
          <h3 className="text-lg text-[#474747] leading-tight pt-4">{movie.title}</h3>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <ClockIcon size={13} />
              {movie.runtimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <FilmIcon size={13} />
              {movie.genre}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#474747]">
              {overall.toFixed(1)}
            </span>
            <Stars value={overall} />
          </div>

          <div className="flex flex-wrap gap-1">
            {Object.entries(movie.scores).map(([name, score]) => (
              <span
                key={name}
                className={`text-sm font-medium px-1.5 py-0.5 rounded ${personBadgeClass(name)}`}
              >
                {name}: {score}
              </span>
            ))}
          </div>

          {movie.watchedDate && (
            <p className="text-sm text-gray-400">
              Watched Date: {formatWatchedDate(movie.watchedDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
