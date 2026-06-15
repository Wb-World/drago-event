import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import { formatDate, formatTime } from './lib/utils'
import logoImg from '../image.png'

/* ── Lightbox ─────────────────────────────────── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">x</button>
      <img src={src} alt="Payment proof" onClick={e => e.stopPropagation()} />
    </div>
  )
}

/* ── Stats Row ────────────────────────────────── */
function StatsRow({ bookings }) {
  const total    = bookings.length
  const pending  = bookings.filter(b => b.status === 'pending').length
  const approved = bookings.filter(b => b.status === 'approved').length
  return (
    <div className="admin-stats-row">
      <div className="admin-stat-card">
        <div className="eyebrow">Total Bookings</div>
        <div className="admin-stat-num">{total}</div>
      </div>
      <div className="admin-stat-card">
        <div className="eyebrow">Pending</div>
        <div className="admin-stat-num pending">{pending}</div>
      </div>
      <div className="admin-stat-card">
        <div className="eyebrow">Approved</div>
        <div className="admin-stat-num approved">{approved}</div>
      </div>
    </div>
  )
}

/* ── Booking Row ──────────────────────────────── */
function BookingRow({ booking, onAction }) {
  const [acting,      setActing]      = useState(false)
  const [rowError,    setRowError]    = useState('')
  const [lightboxSrc, setLightboxSrc] = useState(null)

  async function handleAction(status) {
    setActing(true)
    setRowError('')
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', booking.id)
      if (error) throw error
      await onAction()
    } catch (err) {
      setRowError(err.message || 'Action failed.')
    } finally {
      setActing(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete the booking for Seat ${booking.seat_number}?`)) return
    setActing(true)
    setRowError('')
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id)
      if (error) throw error
      await onAction()
    } catch (err) {
      setRowError(err.message || 'Delete failed.')
    } finally {
      setActing(false)
    }
  }

  return (
    <>
      <tr>
        <td><span className="seat-badge">{booking.seat_number}</span></td>
        <td>{formatDate(booking.submitted_at)}</td>
        <td>
          {booking.proof_image_url ? (
            <img
              src={booking.proof_image_url}
              alt="Proof"
              className="proof-thumb"
              onClick={() => setLightboxSrc(booking.proof_image_url)}
            />
          ) : (
            <div className="proof-placeholder">None</div>
          )}
        </td>
        <td>
          <span className={`chip chip-${booking.status}`}>{booking.status}</span>
          {rowError && <div className="inline-error">{rowError}</div>}
        </td>
        <td style={{ display: 'flex', gap: '8px' }}>
          {booking.status === 'pending' && (
            <>
              <button
                className="btn-approve"
                onClick={() => handleAction('approved')}
                disabled={acting}
              >
                {acting ? '...' : 'Approve'}
              </button>
              <button
                className="btn-reject"
                onClick={() => handleAction('rejected')}
                disabled={acting}
              >
                {acting ? '...' : 'Reject'}
              </button>
            </>
          )}
          <button
            className="btn-delete"
            style={{ 
              background: 'rgba(239, 68, 68, 0.12)', 
              color: '#ff6b6b', 
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onClick={handleDelete}
            disabled={acting}
          >
            {acting ? '...' : 'Delete'}
          </button>
        </td>
      </tr>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  )
}

/* ── Admin App ────────────────────────────────── */
export default function AdminApp() {
  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState('')
  const [lastRefresh, setLastRefresh] = useState(null)
  const intervalRef = useRef(null)

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (error) throw error
      setBookings(data || [])
      setFetchError('')
      setLastRefresh(new Date())
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch bookings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
    intervalRef.current = setInterval(fetchBookings, 15000)
    return () => clearInterval(intervalRef.current)
  }, [fetchBookings])

  async function handleClearAll() {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL bookings from the database? This cannot be undone.')) return
    setLoading(true)
    setFetchError('')
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .gt('seat_number', 0)
      if (error) throw error
      await fetchBookings()
    } catch (err) {
      setFetchError(err.message || 'Failed to clear bookings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Admin Navbar */}
      <nav className="admin-navbar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="Drago Logo" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
          <div className="admin-navbar-title">DRAGO EVENT</div>
        </div>
        <span className="admin-navbar-sep">|</span>
        <div className="admin-navbar-sub">ADMIN</div>
        <button className="navbar-refresh" onClick={fetchBookings}>Refresh</button>
      </nav>

      {fetchError && (
        <div className="error-banner" style={{ marginTop: '64px' }}>
          Error: {fetchError}
        </div>
      )}

      <div className="admin-page">
        <div className="admin-container animate-fade-in-up" style={{ animationDelay: '100ms' }}>

          <StatsRow bookings={bookings} />

          <div className="section-header">
            <h2>All Bookings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {bookings.length > 0 && (
                <button 
                  onClick={handleClearAll} 
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    color: '#ff6b6b', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear All Bookings
                </button>
              )}
              {lastRefresh && (
                <span className="last-refresh">Last updated: {formatTime(lastRefresh)}</span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-row">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="admin-table-wrap">
              <div className="empty-state">No bookings yet.</div>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Seat No.</th>
                    <th>Submitted At</th>
                    <th>Proof Image</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <BookingRow key={b.id} booking={b} onAction={fetchBookings} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
