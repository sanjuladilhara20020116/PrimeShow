import nodemailer from 'nodemailer';

export const sendBookingEmail = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const moviePoster = `https://image.tmdb.org/t/p/w500${booking.show.movie.poster_path}`;
  const showDate = new Date(booking.show.showDateTime).toLocaleDateString('en-US', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });
  const showTime = new Date(booking.show.showDateTime).toLocaleTimeString([], { 
    hour: '2-digit', minute: '2-digit' 
  });

  const mailOptions = {
    from: `"PrimeShow" <${process.env.EMAIL_USER}>`,
    to: booking.user.email,
    subject: `Booking Confirmed: ${booking.show.movie.title}`,
    html: `
      <div style="background-color: #0f0f0f; color: #ffffff; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 20px;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff3d00; margin: 0; font-size: 28px; letter-spacing: 2px;">PRIMESHOW</h1>
          <p style="color: #888; font-size: 12px; margin-top: 5px; text-transform: uppercase;">Movie Booking Confirmation</p>
        </div>

        <div style="border-top: 1px solid #333; padding-top: 30px;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="150" valign="top">
                <img src="${moviePoster}" alt="Poster" style="width: 140px; border-radius: 12px; border: 1px solid #333;">
              </td>
              
              <td style="padding-left: 20px;" valign="top">
                <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #ffffff;">${booking.show.movie.title}</h2>
                <p style="margin: 5px 0; color: #aaa; font-size: 14px;"><b>Booking ID:</b> #${booking._id.toString().toUpperCase().substring(0, 8)}</p>
                <p style="margin: 5px 0; color: #aaa; font-size: 14px;"><b>Date:</b> ${showDate}</p>
                <p style="margin: 5px 0; color: #aaa; font-size: 14px;"><b>Time:</b> ${showTime}</p>
                <p style="margin: 5px 0; color: #aaa; font-size: 14px;"><b>Cinema:</b> Prime Main Screen</p>
                <p style="margin: 15px 0 5px 0; color: #ff3d00; font-size: 18px; font-weight: bold;">Seats: ${booking.bookedSeats.join(', ')}</p>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 15px; margin-top: 30px; border: 1px solid #333;">
          <h3 style="margin-top: 0; font-size: 14px; color: #888; text-transform: uppercase;">Payment Summary</h3>
          <table width="100%">
            <tr>
              <td style="color: #aaa; font-size: 14px; padding: 5px 0;">Tickets Amount</td>
              <td style="color: #fff; font-size: 14px; text-align: right;">$${booking.amount}.00</td>
            </tr>
            <tr>
              <td style="color: #aaa; font-size: 14px; padding: 5px 0;">Booking Fee</td>
              <td style="color: #fff; font-size: 14px; text-align: right;">$0.00</td>
            </tr>
            <tr>
              <td style="color: #ff3d00; font-size: 18px; font-weight: bold; padding-top: 10px;">Total Paid</td>
              <td style="color: #ff3d00; font-size: 18px; font-weight: bold; padding-top: 10px; text-align: right;">$${booking.amount}.00</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="${clientUrl}/my-bookings" 
             style="background-color: #ff3d00; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
             View & Download Invoice PDF
          </a>
        </div>

        <div style="text-align: center; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
          <p style="color: #666; font-size: 12px;">Thank you for choosing PrimeShow Cinemas.</p>
          <p style="color: #666; font-size: 11px;">Please present this email or the PDF at the entrance.</p>
        </div>

      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};