import { useState } from 'react'

const CONTACT_INFO = [
  ['EMAIL',     'community@dragotech.in'],
  ['INSTAGRAM', '@dragocommunity'],
  ['LINKEDIN',  'Drago Community'],
  ['LOCATION',  'Tamil Nadu, India'],
]

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent]  = useState(false)

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    setSent(true)
    setForm(EMPTY)
  }

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <div className="eyebrow">CONTACT</div>
          <h1>Get in Touch</h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '32px' }}>
        <div className="container">
          <div className="contact-grid animate-fade-in-up" style={{ animationDelay: '200ms' }}>

            {/* Left — Contact Info */}
            <div className="contact-left">
              {CONTACT_INFO.map(([label, val]) => (
                <div className="contact-item" key={label}>
                  <div className="eyebrow">{label}</div>
                  <div className="contact-val">{val}</div>
                </div>
              ))}
            </div>

            {/* Right — Form */}
            <div className="contact-right">
              <form onSubmit={submit} className="form-stack">
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={change}
                  required
                />
                <input
                  className="input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={change}
                  required
                />
                <input
                  className="input"
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={change}
                  required
                />
                <textarea
                  className="input"
                  name="message"
                  rows={5}
                  placeholder="Message"
                  value={form.message}
                  onChange={change}
                  required
                />
                {sent && (
                  <p style={{ fontSize: '14px', color: '#22c55e' }}>
                    Message sent. We will get back to you soon.
                  </p>
                )}
                <button type="submit" className="btn-primary full" style={{ marginTop: '8px' }}>
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
