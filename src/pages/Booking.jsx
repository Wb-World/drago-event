import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/utils'
import QRCode from '../components/QRCode'

const TOTAL_SEATS = 200
const USER_ID     = 'user_default'
const ROW_NAMES   = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']

const LEGEND = [
  ['Available', 'seat-available'],
  ['Selected',  'seat-selected'],
  ['Pending',   'seat-pending'],
  ['Approved',  'seat-approved'],
  ['Rejected',  'seat-rejected'],
  ['Booked',    'seat-booked'],
]

function buildSeatMap(bookings) {
  const map = {}
  bookings.forEach(b => {
    const n = b.seat_number
    if (b.status === 'approved') {
      map[n] = { status: 'approved', uid: b.user_id }
    } else if (!map[n]) {
      map[n] = { status: b.status, uid: b.user_id }
    }
  })
  return map
}

export default function Booking({ bookings, refreshBookings, loadingBookings }) {
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [proofFile,    setProofFile]    = useState(null)
  const [previewUrl,   setPreviewUrl]   = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [successMsg,   setSuccessMsg]   = useState('')
  const [errorMsg,     setErrorMsg]     = useState('')
  const [dragActive,   setDragActive]   = useState(false)
  const [currentStep,  setCurrentStep]  = useState(1) // Stepper state: 1 = Select, 2 = Pay, 3 = Upload & Submit, 4 = Success
  
  const fileInputRef = useRef(null)
  const seatMap = buildSeatMap(bookings)
  const myBookings = bookings.filter(b => b.user_id === USER_ID)

  // Reset steps on seat change
  useEffect(() => {
    if (!selectedSeat) {
      setCurrentStep(1)
      setProofFile(null)
      setPreviewUrl(null)
    } else {
      setCurrentStep(2) // Move to pay step once selected
    }
    setErrorMsg('')
    setSuccessMsg('')
  }, [selectedSeat])

  function getSeatState(n) {
    const e = seatMap[n]
    if (!e) return 'available'
    if (e.status === 'approved') return 'booked'
    if (e.uid === USER_ID) {
      if (e.status === 'pending')  return 'pending'
      if (e.status === 'rejected') return 'rejected'
    }
    if (e.status === 'pending') return 'pending'
    return 'available'
  }

  function handleSeatClick(n) {
    const state = getSeatState(n)
    if (state !== 'available' && state !== 'rejected') return
    
    // Toggle seat
    setSelectedSeat(prev => prev === n ? null : n)
  }

  // File Handlers
  function processFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WEBP).')
      return
    }
    setProofFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setErrorMsg('')
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    processFile(file)
  }

  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  function triggerFileInput() {
    fileInputRef.current.click()
  }

  function removeFile() {
    setProofFile(null)
    setPreviewUrl(null)
  }

  async function handleSubmit() {
    if (!proofFile) {
      setErrorMsg('Please upload your payment receipt.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const path = `proofs/seat_${selectedSeat}_${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage
        .from('proofs')
        .upload(path, proofFile, { upsert: true })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path)

      const { error: insErr } = await supabase.from('bookings').insert({
        seat_number:    selectedSeat,
        user_id:        USER_ID,
        status:         'pending',
        proof_image_url: urlData.publicUrl,
        submitted_at:   new Date().toISOString(),
      })
      if (insErr) throw insErr

      setCurrentStep(4) // Show success step
      setSuccessMsg('Booking submitted! Awaiting admin approval.')
      setSelectedSeat(null)
      setProofFile(null)
      setPreviewUrl(null)
      await refreshBookings()
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page animate-fade-in">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <div className="eyebrow">EVENT BOOKING</div>
          <h1>Drago Launch Event</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            Book your slot in the elite seat zone. Review layout and secure tickets below.
          </p>
          <div className="price-badge">Seat Price: Rs. 99</div>
        </div>

        {/* Legend */}
        <div className="legend-row animate-fade-in-up" style={{ animationDelay: '100ms', justifyContent: 'center' }}>
          {LEGEND.map(([label, cls]) => (
            <div className="legend-item" key={label}>
              <div className={`legend-box seat ${cls}`} style={{ cursor: 'default' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Booking Container Grid */}
        <div className="booking-grid" style={{ marginTop: '40px' }}>
          
          {/* Theater Curved Seat Map */}
          <div className="theater-container animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="theater-stage"></div>
            
            {loadingBookings ? (
              // Skeleton seats loading state
              <div className="theater-seats-scroll-wrapper" style={{ overflowX: 'auto', width: '100%', paddingBottom: '16px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '680px', margin: '0 auto' }}>
                  {ROW_NAMES.map((rowName, rIdx) => (
                    <div className={`seat-row seat-row-${rowName}`} key={rowName}>
                      {Array.from({ length: 20 }, (_, cIdx) => {
                        const colIndex = cIdx + 1
                        return (
                          <div key={colIndex} className={`seat-wrapper seat-col-${colIndex}`}>
                            <div className="seat skeleton" style={{ width: '28px', height: '28px' }} />
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="theater-seats-scroll-wrapper" style={{ overflowX: 'auto', width: '100%', paddingBottom: '16px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '680px', margin: '0 auto' }}>
                  {ROW_NAMES.map((rowName, rIdx) => (
                    <div className={`seat-row seat-row-${rowName}`} key={rowName}>
                      {Array.from({ length: 20 }, (_, cIdx) => {
                        const colIndex = cIdx + 1
                        const seatNum = rIdx * 20 + colIndex
                        const state = getSeatState(seatNum)
                        const isSel = selectedSeat === seatNum
                        const seatCls = isSel ? 'seat-selected' : `seat-${state}`
                        
                        return (
                          <div key={seatNum} className={`seat-wrapper seat-col-${colIndex}`}>
                            <div 
                              className={`seat ${seatCls}`}
                              onClick={() => handleSeatClick(seatNum)}
                              title={`Seat ${rowName}${colIndex} (Seat No. ${seatNum}) - Status: ${state.toUpperCase()}`}
                            >
                              {seatNum}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stepper Checkout Panel */}
          <div className="checkout-panel animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            
            {/* Stepper Header Progress */}
            <div className="stepper">
              <div className="stepper-progress" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>3</div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>✓</div>
            </div>

            {/* Stepper Wizard Forms */}
            {currentStep === 1 && (
              <div className="checkout-details animate-fade-in">
                <h3>Select A Seat</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                  Choose a ticket seat from the interactive venue map on the left. Once selected, you can proceed with the ticket billing sequence.
                </p>
                <div style={{ marginTop: '32px', padding: '16px', border: '1px dashed var(--border)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Awaiting Seat Selection...
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="checkout-details animate-fade-in">
                <h3>Pay Admission</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                  Scan the UPI QR code below and complete the admission payment of Rs. 99.
                </p>

                <div className="checkout-qr-container" style={{ marginTop: '24px' }}>
                  <div className="checkout-qr-glow">
                    <QRCode />
                  </div>
                  <p className="qr-label">Drago Launch Event Ticket — Rs. 99</p>
                </div>

                <div className="checkout-price-row">
                  <span>Ticket Price:</span>
                  <span>Rs. 99</span>
                </div>

                <button 
                  className="btn-primary full" 
                  onClick={() => setCurrentStep(3)}
                >
                  I've Paid — Upload Receipt
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="checkout-details animate-fade-in">
                <h3>Upload Payment Proof</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '20px', lineHeight: 1.6 }}>
                  Drag and drop the screenshot of your payment receipt below or click to browse.
                </p>

                {/* Drag Drop Area */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {!proofFile ? (
                  <div 
                    className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <p>Click to choose file or drag receipt here</p>
                    <span>Supports JPG, PNG, WEBP files</span>
                  </div>
                ) : (
                  <div className="uploaded-preview-container">
                    <img src={previewUrl} alt="Preview" className="uploaded-preview-img" />
                    <div className="uploaded-preview-info">
                      <div className="uploaded-preview-name">{proofFile.name}</div>
                      <div className="uploaded-preview-size">{(proofFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button className="btn-remove-file" onClick={removeFile}>Remove</button>
                  </div>
                )}

                {errorMsg && <p className="msg-error" style={{ marginBottom: '16px' }}>{errorMsg}</p>}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setCurrentStep(2)}
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1 }}
                    onClick={handleSubmit}
                    disabled={loading || !proofFile}
                  >
                    {loading ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="checkout-details success-card animate-fade-in">
                <div className="success-icon">✓</div>
                <h3>Ticket Requested!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.7 }}>
                  {successMsg || 'Your seat booking request has been submitted successfully.'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.7 }}>
                  Our team will review your payment receipt. Once approved, the seat turns green on the map and your ticket is locked.
                </p>
                <button 
                  className="btn-secondary full" 
                  style={{ marginTop: '24px' }}
                  onClick={() => setCurrentStep(1)}
                >
                  Book Another Seat
                </button>
              </div>
            )}

          </div>

        </div>

        {/* My Bookings Table */}
        <div className="my-bookings animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3>My Bookings</h3>
          {myBookings.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px' }}>
              You have not requested any seat tickets yet. Select a seat above to begin.
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Seat Number</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '600', color: '#ffffff' }}>Seat {b.seat_number}</td>
                      <td>
                        <span className={`chip chip-${b.status}`}>{b.status}</span>
                      </td>
                      <td>{formatDate(b.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
