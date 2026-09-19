// Shared per-person color coding for score badges/pills across MovieCard + CompleteModal.
export const PERSON_BADGE = {
  Chisa: 'bg-rose-100 text-rose-600',
  Gerard: 'bg-emerald-100 text-emerald-600',
}

export const personBadgeClass = (name) => PERSON_BADGE[name] ?? 'bg-gray-100 text-gray-500'

// Solid variant for chat-style note bubbles.
export const PERSON_BUBBLE = {
  Chisa: 'bg-rose-400',
  Gerard: 'bg-sage',
}

export const personBubbleClass = (name) => PERSON_BUBBLE[name] ?? 'bg-gray-400'
