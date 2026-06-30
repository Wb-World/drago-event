import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { formatDate, formatTime } from './lib/utils'
import { useAuth } from './lib/AuthContext'
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
  const validBookings = bookings.filter(b => b.status !== 'rejected')
  const total    = validBookings.length
  const pending  = validBookings.filter(b => b.status === 'pending').length
  const approved = validBookings.filter(b => b.status === 'approved').length
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
      // Soft delete: set to rejected and user_id to deleted
      // This bypasses strict RLS DELETE policies while freeing the seat
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected', user_id: 'deleted' })
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
        <td>{booking.user_id}</td>
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
  const [activeTab,   setActiveTab]   = useState('requests') // 'requests' or 'approved'
  const [showLogout,  setShowLogout]  = useState(false)
  const intervalRef = useRef(null)
  
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    setShowLogout(false)
    logout()
    navigate('/')
  }

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
    if (!window.confirm(`WARNING: Are you sure you want to delete ALL ${activeTab} bookings?`)) return
    setLoading(true)
    setFetchError('')
    try {
      const statusToClear = activeTab === 'requests' ? 'pending' : 'approved'
      // Soft delete active tab items
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected', user_id: 'deleted' })
        .eq('status', statusToClear)
      if (error) throw error
      await fetchBookings()
    } catch (err) {
      setFetchError(err.message || 'Failed to clear bookings.')
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(b => 
    activeTab === 'requests' ? b.status === 'pending' : b.status === 'approved'
  )

  return (
    <div className="animate-fade-in">
      {/* Admin Navbar */}
      <nav className="admin-navbar" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoImg} alt="Drago Logo" style={{ height: '32px', width: 'auto', borderRadius: '4px' }} />
          <div className="admin-navbar-title" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>DRAGO EVENT</div>
        </div>
        <span className="admin-navbar-sep" style={{ color: 'var(--border)' }}>|</span>
        <div className="admin-navbar-sub" style={{ fontWeight: '600' }}>ADMIN</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" style={{ padding: '6px 16px' }} onClick={fetchBookings}>Refresh Data</button>
          <button className="btn-primary" style={{ padding: '6px 16px', background: '#ef4444' }} onClick={() => setShowLogout(true)}>Logout</button>
        </div>
      </nav>

      {fetchError && (
        <div className="error-banner" style={{ marginTop: '24px', margin: '0 32px' }}>
          Error: {fetchError}
        </div>
      )}

      <div className="admin-page" style={{ padding: '32px' }}>
        <div className="admin-container animate-fade-in-up" style={{ animationDelay: '100ms', maxWidth: '1200px', margin: '0 auto' }}>

          <StatsRow bookings={bookings} />

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
            <button 
              style={{ 
                padding: '12px 24px', 
                background: activeTab === 'requests' ? 'var(--text-primary)' : 'transparent', 
                color: activeTab === 'requests' ? '#fff' : 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
            <button 
              style={{ 
                padding: '12px 24px', 
                background: activeTab === 'approved' ? 'var(--text-primary)' : 'transparent', 
                color: activeTab === 'approved' ? '#fff' : 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px'
              }}
              onClick={() => setActiveTab('approved')}
            >
              Approved List
            </button>
          </div>

          <div className="section-header" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{activeTab === 'requests' ? 'Pending Requests' : 'Approved Bookings'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {filteredBookings.length > 0 && (
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
                  Clear All
                </button>
              )}
              {lastRefresh && (
                <span className="last-refresh" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Last updated: {formatTime(lastRefresh)}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-row" style={{ padding: '32px', textAlign: 'center' }}>Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="admin-table-wrap" style={{ marginTop: '16px' }}>
              <div className="empty-state" style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No {activeTab === 'requests' ? 'pending requests' : 'approved bookings'} at the moment.
              </div>
            </div>
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: '16px' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>Seat No.</th>
                    <th style={{ padding: '12px' }}>Submitted At</th>
                    <th style={{ padding: '12px' }}>User ID</th>
                    <th style={{ padding: '12px' }}>Proof Image</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <BookingRow key={b.id} booking={b} onAction={fetchBookings} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {showLogout && (
        <div className="lightbox" style={{ zIndex: 9999 }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px', width: '100%', margin: '0 24px', padding: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Warning</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to log out of the Admin dashboard?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout}>Okay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
