import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home    from './pages/Home'
import About   from './pages/About'
import Booking from './pages/Booking'
import Contact from './pages/Contact'
import Login   from './pages/Login'
import Profile from './pages/Profile'
import AdminApp from './AdminApp'
import logoImg from '../image.png'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ProtectedRoute({ children, requireAdmin }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (!requireAdmin && currentUser.role !== 'admin' && !currentUser.profileCompleted && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />
  }

  return children
}

function Inner() {
  const location = useLocation()
  const { currentUser, loading: authLoading } = useAuth()
  const [bookings,         setBookings]         = useState([])
  const [bookingsError,    setBookingsError]    = useState('')
  const [loadingBookings,  setLoadingBookings]  = useState(true)
  const [initialLoading,   setInitialLoading]   = useState(true)
  const [routeLoading,     setRouteLoading]     = useState(false)

  // Fetch bookings from database
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true)
    try {
      const { data, error } = await supabase.from('bookings').select('*')
      if (error) throw error
      setBookings(data || [])
      setBookingsError('')
    } catch (err) {
      setBookingsError(err.message || 'Failed to load bookings.')
    } finally {
      setLoadingBookings(false)
    }
  }, [])

  // Initial mount load simulation
  useEffect(() => {
    fetchBookings().then(() => {
      const timer = setTimeout(() => {
        setInitialLoading(false)
      }, 1500)
      return () => clearTimeout(timer)
    })
  }, [fetchBookings])

  // Trigger top loader progress on route changes
  useEffect(() => {
    setRouteLoading(true)
    const timer = setTimeout(() => {
      setRouteLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [location.pathname])

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {/* Global Page Preloader */}
      <div className={`preloader-overlay ${(!initialLoading && !authLoading) ? 'fade-out' : ''}`}>
        <img src={logoImg} alt="Drago Logo" className="preloader-logo-img" style={{ height: '56px', width: 'auto', marginBottom: '24px', display: 'block', borderRadius: '8px' }} />
        <div className="preloader-spinner"></div>
      </div>

      {/* Top Routing Progress Bar */}
      {routeLoading && <div className="top-loader" />}

      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      {bookingsError && !isAdminRoute && (
        <div className="error-banner" style={{ marginTop: '64px' }}>
          Database Error: {bookingsError}
        </div>
      )}

      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login"   element={<Login />} />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <Booking 
                bookings={bookings} 
                refreshBookings={fetchBookings} 
                loadingBookings={loadingBookings} 
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Inner />
      </HashRouter>
    </AuthProvider>
  )
}
