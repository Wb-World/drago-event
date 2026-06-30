import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register(username, password)
        navigate('/profile')
      } else {
        const { user } = await login(username, password)
        if (user.role === 'admin') {
          navigate('/admin')
        } else if (!user.profileCompleted) {
          navigate('/profile')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && (
          <div className="msg-error" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', border: '1px solid #ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Username</label>
            <input 
              type="text" 
              className="input" 
              placeholder={isRegister ? "Letters, numbers, @ . _ only" : "Enter username"} 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Enter password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px' }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span 
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
          >
            {isRegister ? 'Login here' : 'Sign up here'}
          </span>
        </div>
      </div>
    </div>
  )
}
