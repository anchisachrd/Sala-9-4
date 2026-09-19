import { StarIcon } from './icons'

// value = score out of 10, rendered as 5 stars with partial (fractional) fill.
export default function Stars({ value, size = 14 }) {
  const exact = (value / 10) * 5

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const fraction = Math.max(0, Math.min(1, exact - i))
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <StarIcon size={size} className="absolute inset-0 text-gray-300" />
            {fraction > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fraction * 100}%` }}
              >
                <StarIcon size={size} className="fill-amber-400 text-amber-400" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
