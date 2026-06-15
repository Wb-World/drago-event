import { useNavigate } from 'react-router-dom'

const LINKS = [
  { label: 'Home',          to: '/'        },
  { label: 'About',         to: '/about'   },
  { label: 'Event Booking', to: '/booking' },
  { label: 'Contact Us',    to: '/contact' },
]

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">DRAGO EVENT</div>
            <div className="footer-tagline">Products Built by People Who Build Tech.</div>
          </div>
          <nav className="footer-links">
            {LINKS.map(l => (
              <a key={l.to} onClick={() => navigate(l.to)}>{l.label}</a>
            ))}
          </nav>
          <div className="footer-copy">2025 Drago Community. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
