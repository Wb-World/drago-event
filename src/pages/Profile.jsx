import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Profile() {
  const { currentUser, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin') // Admin has no profile
      }
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
      setMobile(currentUser.mobile || '')
    }
  }, [currentUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await updateProfile({ name, email, mobile })
      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        navigate('/booking') // redirect to booking once completed
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) return null

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Your Profile</h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please complete your profile to access bookings.
        </p>
        
        {error && (
          <div className="msg-error" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="msg-success" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '4px', border: '1px solid #10b981' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. John Doe" 
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              className="input" 
              placeholder="e.g. user@gmail.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Mobile Number</label>
            <input 
              type="tel" 
              className="input" 
              placeholder="e.g. 9876543210" 
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
