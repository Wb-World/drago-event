import { useNavigate } from 'react-router-dom'

const STATS = [
  ['100,000+', 'Students Engaged'],
  ['Pan-India', 'College Reach'],
  ['Growing', 'Builder Network'],
]

const WHAT = [
  ['01', 'Community Building', 'We create and connect tech communities across colleges, helping students collaborate, learn, and grow together.'],
  ['02', 'Events and Workshops', 'We organize workshops, meetups, and full-day events focused on practical learning, networking, and exposure.'],
  ['03', 'Product Development', 'We encourage students to build real-world projects that solve meaningful problems.'],
  ['04', 'Project Showcase Platform', 'Students can upload their projects, gain visibility, and receive feedback from peers and experts.'],
]

const WHY_MINUS = ['No copy-paste projects', 'No AI dependency', 'No passive learning']
const WHY_PLUS = ['Real builders focus', 'Original thinking', 'Practical learning', 'Community-driven growth', 'Built for impact']

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page animate-fade-in">
      {/* ── HERO SECTION ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <span className="badge">PRODUCTS BUILT BY PEOPLE WHO BUILD TECH.</span>
            </div>

            <h1 className="animate-fade-in-up" style={{ animationDelay: '200ms', textTransform: 'uppercase', fontWeight: 800, fontSize: '5rem', lineHeight: 1.1 }}>
              PRODUCTS BUILT BY<br />
              <span style={{ backgroundColor: '#000000', color: '#ffffff', padding: '0 12px', display: 'inline-block' }}>
                PEOPLE
              </span> WHO BUILD TECH.
            </h1>

            <p className="hero-desc animate-fade-in-up" style={{ animationDelay: '300ms', fontWeight: 600, color: '#000000' }}>
              Drago Community is a technology-driven ecosystem where students become creators,
              innovators, and real-world problem solvers.
            </p>

            <div className="btn-row animate-fade-in-up" style={{ animationDelay: '400ms', justifyContent: 'center', marginTop: '40px', display: 'flex', gap: '16px' }}>
              <button className="btn-primary" onClick={() => navigate('/booking')} style={{ fontSize: '16px', padding: '16px 32px' }}>
                BOOK YOUR SEAT
              </button>
              <button className="btn-secondary" onClick={() => navigate('/about')} style={{ fontSize: '16px', padding: '16px 32px', border: '3px solid black', color: 'black', fontWeight: 700, backgroundColor: 'white', boxShadow: '4px 4px 0px 0px black' }}>
                LEARN MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <div className="stats-row animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        {STATS.map(([num, label], index) => (
          <div className="stat-item" key={label}>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── BENTO GRID FEATURES ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-in-up">
            <div className="eyebrow">WHAT WE DO</div>
            <h2 style={{ fontSize: '36px', marginTop: '8px' }}>How We Build the Community</h2>
          </div>

          <div className="what-we-do-grid">
            {WHAT.map(([num, title, desc], i) => (
              <div
                className="what-card animate-fade-in-up"
                key={num}
                style={{ animationDelay: `${150 * (i + 1)}ms` }}
              >
                <div className="what-num">{num}</div>
                <h3 style={{ marginBottom: '12px' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DRAGO SECTION ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="why-grid">
            <div className="animate-fade-in-up">
              <div className="eyebrow">PHILOSOPHY</div>
              <h2 style={{ fontSize: '36px', marginTop: '8px', lineHeight: '1.2' }}>
                What Makes Us<br />Different
              </h2>
            </div>

            <div className="why-columns animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  What We Avoid
                </h4>
                {WHY_MINUS.map((t, idx) => (
                  <div className="why-item" key={t} style={{ borderLeft: '3px solid var(--danger)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  What We Focus On
                </h4>
                {WHY_PLUS.map((t, idx) => (
                  <div className="why-item" key={t} style={{ borderLeft: '3px solid var(--success)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-center animate-fade-in-up">
            <h2 style={{ marginBottom: '32px', textTransform: 'uppercase', fontWeight: 800 }}>
              If you want to build something real,<br />
              <span style={{ backgroundColor: '#000000', color: '#ffffff', padding: '0 8px', display: 'inline-block' }}>
                Drago
              </span> is where you start.
            </h2>
            <button className="btn-primary lg" onClick={() => navigate('/about')}>
              Join the Community
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
