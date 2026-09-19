export function formatWatchedDate(isoDate) {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function averageScore(scores) {
  const values = Object.values(scores)
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
