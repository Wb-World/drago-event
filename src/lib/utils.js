export function formatDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const hh  = String(d.getHours()).padStart(2, '0')
  const mm  = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`
}

export function formatTime(ts) {
  if (!ts) return ''
  const d  = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
