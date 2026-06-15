import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iqlsejlxrzduzblabcry.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbHNlamx4eHJ6ZHV6YmxhYmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTUwNDYsImV4cCI6MjA5NzA5MTA0Nn0.jZJm2g7NiEfJxLIVV1nH46ZEvP7ZmP7QQKsM1RdVfNQ'

const isMock = !SUPABASE_URL || SUPABASE_URL.includes('YOUR_') || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('YOUR_')

const MOCK_STORAGE_KEY = 'drago_event_mock_bookings'

function getMockBookings() {
  const data = localStorage.getItem(MOCK_STORAGE_KEY)
  if (!data) {
    // Populate some initial mock bookings to make the dashboard look populated and active
    const initial = [
      {
        id: 'mock-1',
        seat_number: 12,
        user_id: 'user_other_1',
        status: 'approved',
        proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        submitted_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
      },
      {
        id: 'mock-2',
        seat_number: 45,
        user_id: 'user_other_2',
        status: 'pending',
        proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        submitted_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: 'mock-3',
        seat_number: 88,
        user_id: 'user_default', // The current user
        status: 'pending',
        proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        submitted_at: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
      },
      {
        id: 'mock-4',
        seat_number: 150,
        user_id: 'user_other_3',
        status: 'rejected',
        proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        submitted_at: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(data)
}

function saveMockBookings(bookings) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(bookings))
}

const mockSupabase = {
  from(table) {
    if (table !== 'bookings') {
      return {
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      }
    }

    return {
      select(columns) {
        const bookings = getMockBookings()
        const promise = Promise.resolve({ data: bookings, error: null })
        promise.order = function(col, { ascending } = {}) {
          const sorted = [...bookings].sort((a, b) => {
            const valA = a[col] || ''
            const valB = b[col] || ''
            if (valA < valB) return ascending ? -1 : 1
            if (valA > valB) return ascending ? 1 : -1
            return 0
          })
          return Promise.resolve({ data: sorted, error: null })
        }
        return promise
      },
      insert(row) {
        const bookings = getMockBookings()
        const newRow = {
          id: 'mock-' + Math.random().toString(36).substr(2, 9),
          ...row
        }
        bookings.push(newRow)
        saveMockBookings(bookings)
        return Promise.resolve({ data: [newRow], error: null })
      },
      update(values) {
        return {
          eq(field, value) {
            const bookings = getMockBookings()
            const updatedBookings = bookings.map(b => {
              if (b[field] === value) {
                return { ...b, ...values }
              }
              return b
            })
            saveMockBookings(updatedBookings)
            return Promise.resolve({ data: null, error: null })
          }
        }
      }
    }
  },
  storage: {
    from(bucket) {
      return {
        async upload(path, file, options) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64data = reader.result
              const proofs = JSON.parse(localStorage.getItem('drago_mock_proofs') || '{}')
              proofs[path] = base64data
              localStorage.setItem('drago_mock_proofs', JSON.stringify(proofs))
              resolve({ data: { path }, error: null })
            }
            reader.onerror = () => {
              const url = URL.createObjectURL(file)
              const proofs = JSON.parse(localStorage.getItem('drago_mock_proofs') || '{}')
              proofs[path] = url
              localStorage.setItem('drago_mock_proofs', JSON.stringify(proofs))
              resolve({ data: { path }, error: null })
            }
            reader.readAsDataURL(file)
          })
        },
        getPublicUrl(path) {
          const proofs = JSON.parse(localStorage.getItem('drago_mock_proofs') || '{}')
          const url = proofs[path] || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
          return { data: { publicUrl: url } }
        }
      }
    }
  }
}

export const supabase = isMock ? mockSupabase : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

