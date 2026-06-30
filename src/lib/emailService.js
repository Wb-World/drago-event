import emailjs from '@emailjs/browser';

// -------------------------------------------------------------
// EMAILJS CONFIGURATION
// Create an account at https://www.emailjs.com/ to get these IDs
// -------------------------------------------------------------
const SERVICE_ID = 'service_kevkozr';
const TEMPLATE_ID = 'template_xxgieq6';
const PUBLIC_KEY = 'Ai9JhohWge71ZDN58';

/**
 * Sends a welcome/confirmation email with ticket details using EmailJS.
 * 
 * @param {Object} user - The user object (name, email, mobile)
 * @param {Object} booking - The booking object (seat_number, etc.)
 * @param {String} qrDataUrl - The base64 data URL of the QR code image
 * @param {String} qrData - The raw data used to generate the QR code
 */
export const sendTicketEmail = async (user, booking, qrDataUrl, qrData) => {
  if (SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') {
    console.warn('EmailJS is not configured. Please set SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY in src/lib/emailService.js');
    return { success: false, message: 'Email service not configured.' };
  }

  try {
    // We generate a direct image URL for the QR code so it displays flawlessly in Gmail
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData || '')}`;

    // Provide a link to your logo here
    const logoUrl = 'https://dummyimage.com/200x50/121212/ffffff&text=DRAGO+EVENT';

    const templateParams = {
      to_name: user.name || 'Attendee',
      to_email: user.email || user.username || '',
      seat_number: booking.seat_number,
      event_name: 'Drago Launch Event',
      Booking_id: booking.id || 'N/A',
      logo_url: logoUrl,
      qr_code_url: qrCodeUrl,
      message: `Welcome ${user.name || 'Attendee'}! Your booking for seat ${booking.seat_number} has been confirmed. Enjoy the event!`,
    };

    console.log("Sending to EmailJS with params:", templateParams);

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Email sent successfully!', response.status, response.text);
    return { success: true };
  } catch (err) {
    console.error('Failed to send email:', err.text || err.message || err);
    return { success: false, error: err.text || err.message || 'Unknown error' };
  }
};
