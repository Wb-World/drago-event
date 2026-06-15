import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const LINKS = [
  { label: 'Home',          to: '/'        },
  { label: 'About',         to: '/about'   },
  { label: 'Event Booking', to: '/booking' },
  { label: 'Contact Us',    to: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-logo" onClick={() => { navigate('/'); close() }}>
            DRAGO EVENT<span>.</span>
          </span>

          <ul className="navbar-links">
            {LINKS.map(l => (
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
          </ul>

          <button className={`hamburger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {LINKS.map(l => (
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
      </div>
    </>
  )
}
