import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import logoImg from '../../image.png'

const BASE_LINKS = [
  { label: 'HOME',          to: '/'        },
  { label: 'ABOUT',         to: '/about'   },
  { label: 'EVENT BOOKING', to: '/booking' },
  { label: 'CONTACT US',    to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  const close = () => setOpen(false)

  const handleLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/')
    close()
  }

  // Generate dynamic links based on auth state
  const getLinks = () => {
    let links = [...BASE_LINKS]
    if (!currentUser) {
      links.push({ label: 'LOGIN', to: '/login' })
    } else {
      if (currentUser.role !== 'admin') {
        links.push({ label: 'PROFILE', to: '/profile' })
      }
      // Note: Admin links could be added here if needed, but the admin interface is separate
    }
    return links
  }

  const links = getLinks()

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-logo" onClick={() => { navigate('/'); close() }} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000', fontSize: '24px', cursor: 'pointer' }}>
            <img src={logoImg} alt="Drago Logo" style={{ height: '32px', width: 'auto', display: 'block', borderRadius: '4px' }} />
            DRAGO EVENT
          </span>

          <ul className="navbar-links">
            {links.map(l => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  end={l.to === '/'}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {currentUser && (
              <li>
                <span 
                  onClick={() => setShowLogoutModal(true)} 
                  style={{ cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  LOGOUT
                </span>
              </li>
            )}
          </ul>

          <button className={`hamburger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => isActive ? 'active' : ''}
            end={l.to === '/'}
            onClick={close}
          >
            {l.label}
          </NavLink>
        ))}
        {currentUser && (
          <span 
            onClick={() => { setShowLogoutModal(true); close(); }} 
            style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer', paddingBottom: '4px' }}
          >
            LOGOUT
          </span>
        )}
      </div>

      {showLogoutModal && (
        <div className="lightbox" style={{ zIndex: 9999 }}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px', width: '100%', margin: '0 24px', padding: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Warning</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to log out? You will need to log back in to access your bookings.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout}>Okay</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
