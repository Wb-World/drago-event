import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import './TicketModal.css';
import { sendTicketEmail } from '../lib/emailService';

export default function TicketModal({ booking, user, onClose }) {
  const ticketRef = useRef(null);
  const [emailStatus, setEmailStatus] = useState('idle'); // idle, sending, sent, error

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#121212', scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Drago_Ticket_Seat_${booking.seat_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket', err);
    }
  };

  const qrData = JSON.stringify({
    booking_id: booking.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    seat: booking.seat_number,
    event: 'Drago Launch Event'
  });

  const handleSendEmail = async () => {
    if (!ticketRef.current) return;
    setEmailStatus('sending');
    try {
      // Capture the ticket as an image to attach/embed
      const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#121212', scale: 1.5 });
      const dataUrl = canvas.toDataURL('image/png');
      
      const res = await sendTicketEmail(user, booking, dataUrl, qrData);
      if (res.success) {
        setEmailStatus('sent');
      } else {
        console.error("EmailJS Error:", res.error || res.message);
        setEmailStatus('error');
        alert("Email failed to send. Check the console for details.");
      }
    } catch (err) {
      console.error("Catch Error:", err);
      setEmailStatus('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content ticket-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="ticket-card" ref={ticketRef}>
          <div className="ticket-header">
            <h2>Drago Launch Event</h2>
            <div className="ticket-badge">ADMISSION TICKET</div>
          </div>
          
          <div className="ticket-body">
            <div className="ticket-info">
              <div className="info-group">
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className="info-group">
                <label>Mobile</label>
                <p>{user.mobile}</p>
              </div>
              <div className="info-group">
                <label>Seat Number</label>
                <p className="seat-highlight">{booking.seat_number}</p>
              </div>
              <div className="info-group">
                <label>Booking ID</label>
                <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', opacity: 0.8 }}>{booking.id || 'N/A'}</p>
              </div>
            </div>
            
            <div className="ticket-qr">
              <QRCodeSVG 
                value={qrData} 
                size={140} 
                level="H" 
                includeMargin={true} 
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>
          
          <div className="ticket-footer">
            <p>Please present this QR code at the entrance.</p>
          </div>
        </div>

        <div className="ticket-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleSendEmail} disabled={emailStatus === 'sending'}>
            {emailStatus === 'sending' ? 'Sending...' : emailStatus === 'sent' ? 'Email Sent ✓' : 'Send to Email'}
          </button>
          <button className="btn-primary" onClick={downloadTicket} style={{ flex: 1 }}>
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
