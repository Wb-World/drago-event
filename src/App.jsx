import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home    from './pages/Home'
import About   from './pages/About'
import Booking from './pages/Booking'
import Contact from './pages/Contact'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Inner() {
  const location = useLocation()
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

  return (
    <>
      {/* Global Page Preloader */}
      <div className={`preloader-overlay ${!initialLoading ? 'fade-out' : ''}`}>
        <div className="preloader-logo">DRAGO<span>.</span></div>
        <div className="preloader-spinner"></div>
      </div>

      {/* Top Routing Progress Bar */}
      {routeLoading && <div className="top-loader" />}

      <ScrollToTop />
      <Navbar />

      {bookingsError && (
        <div className="error-banner" style={{ marginTop: '64px' }}>
          Database Error: {bookingsError}
        </div>
      )}

      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route 
          path="/booking" 
          element={
            <Booking 
              bookings={bookings} 
              refreshBookings={fetchBookings} 
              loadingBookings={loadingBookings} 
            />
          } 
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Inner />
    </HashRouter>
  )
}
