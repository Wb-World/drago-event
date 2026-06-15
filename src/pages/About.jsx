const STATS = [
  ['100,000+', 'Students Engaged'],
  ['Pan-India', 'College Reach'],
  ['Growing',   'Builder Network'],
]

const PHILOSOPHY = [
  ['Creative Thinking',       'Develop ideas that machines cannot replicate.'],
  ['Deep Problem Solving',    'Understand root causes and build lasting solutions.'],
  ['Smart Decision Making',   'Think critically, act with intent and clarity.'],
  ['Real-World Execution',    'Move from ideas to working products that matter.'],
  ['Original Product Building','Create unique tech with your own hands and mind.'],
]

const VISION = [
  'Students become industry-ready through real experience',
  'Innovation driven by human intelligence',
  'Communities collaborate to build impactful products',
  'Technology created with purpose',
]

const GAIN = [
  ['01', 'Real-world problem-solving mindset'],
  ['02', 'How to build meaningful tech products'],
  ['03', 'Hands-on development experience'],
  ['04', 'Connect with creators and experts'],
  ['05', 'Build a strong project portfolio'],
  ['06', 'Confidence in your skills and ideas'],
]

const ELITE_CHIPS = [
  'Exclusive event access', 'Premium features',
  'Increased visibility', 'Industry networking', 'Top builder status',
]

const COLLAB = [
  'Launching official Drago Chapters',
  'Workshops and hackathons',
  'Real-world student exposure',
  'Culture of innovation on campus',
]

export default function About() {
  return (
    <div className="page animate-fade-in">
      {/* ── Page Header ── */}
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <div className="eyebrow">ABOUT</div>
          <h1>More Than a Community</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '16px', maxWidth: '540px', margin: '16px auto 0', lineHeight: '1.7' }}>
            Drago is a movement designed to transform how students learn and build in the modern world.
          </p>
        </div>
      </div>

      <hr className="divider" />

      {/* ── What is Drago ── */}
      <section className="section">
        <div className="container">
          <div className="two-col">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="eyebrow">THE MOVEMENT</div>
              <h2 style={{ fontSize: '32px', marginTop: '8px' }}>What is Drago?</h2>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Drago Community is not just another tech group. It is a movement designed to transform how
                students learn and build in the modern world. We focus on developing individuals who can create
                real, impactful technology instead of just learning theory or copying existing solutions.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '16px' }}>
                In a time where AI can generate code, content, and designs instantly, Drago emphasizes something more
                powerful — human intelligence, creativity, and execution. We believe that true learning happens
                when you build, experiment, fail, and solve real-world problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Philosophy ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in-up">
            <div className="eyebrow">CORE PHILOSOPHY</div>
            <h2 style={{ fontSize: '32px', marginTop: '8px' }}>Built Beyond AI</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '12px', margin: '12px auto 0', maxWidth: '540px' }}>
              Technology is evolving fast. AI tools can generate almost anything — but they cannot replace original human thinking.
            </p>
          </div>
          
          <div className="philosophy-grid">
            {PHILOSOPHY.map(([title, desc], i) => (
              <div 
                className="philosophy-card animate-fade-in-up" 
                key={title}
                style={{ animationDelay: `${100 * (i + 1)}ms` }}
              >
                <h4 style={{ color: '#ffffff' }}>{title}</h4>
                <p style={{ marginTop: '8px' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="mission-vision">
            <div className="card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="eyebrow">OUR MISSION</div>
              <h3 style={{ marginTop: '8px' }}>To Forge Real Builders</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '12px' }}>
                To create a generation of builders, innovators, and problem-solvers who develop meaningful
                technology that solves real-world challenges. We aim to move students from passive learners
                to active creators.
              </p>
            </div>
            
            <div className="card animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="eyebrow">OUR VISION</div>
              <h3 style={{ marginTop: '8px', marginBottom: '16px' }}>Future of Tech Creation</h3>
              {VISION.map(v => <div className="vision-item" key={v}>{v}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <div className="stats-row animate-fade-in-up">
        {STATS.map(([num, label]) => (
          <div className="stat-item" key={label}>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── What You Gain ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-in-up">
            <div className="eyebrow">THE EXPERIENCE</div>
            <h2 style={{ fontSize: '32px', marginTop: '8px' }}>What You Gain From Drago</h2>
          </div>
          
          <div className="gain-grid">
            {GAIN.map(([num, text], i) => (
              <div 
                className="gain-item animate-fade-in-up" 
                key={num}
                style={{ animationDelay: `${100 * (i + 1)}ms` }}
              >
                <div className="eyebrow">{num}</div>
                <p style={{ fontWeight: '500', color: '#ffffff' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Elite Pass ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="elite-card animate-fade-in-up">
            <div className="elite-badge">DRAGO ELITE</div>
            <h3>The Elite Pass</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '560px', margin: '12px auto 0', lineHeight: '1.7' }}>
              Awarded exclusively to top-performing creators in the community. This pass is not purchased — it is earned through original work, product builds, and real impact.
            </p>
            <div className="elite-chips">
              {ELITE_CHIPS.map(c => <div className="elite-chip" key={c}>{c}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── College Collab ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="two-col">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="eyebrow">CHAPTERS</div>
              <h2 style={{ fontSize: '32px', marginTop: '8px' }}>Partner With Drago</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.8, maxWidth: '440px' }}>
                We collaborate directly with leading academic institutions to establish Chapters and cultivate a high-exposure innovation ecosystem on campus.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {COLLAB.map(i => <div className="collab-item" key={i}>{i}</div>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
