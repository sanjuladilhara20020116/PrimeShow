import nodemailer from 'nodemailer';

export const sendBookingEmail = async (booking) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // Your 16-character APP PASSWORD
    },
    tls: {
    rejectUnauthorized: false
  }
  });

  const mailOptions = {
    from: `"Prime Show" <${process.env.EMAIL_USER}>`,
    to: booking.user.email,
    subject: `Booking Confirmed: ${booking.show.movie.title}`,
    html: `
      <div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #ff3d00;">Prime Show Confirmation</h2>
        <p>Hello ${booking.user.name},</p>
        <p>Your payment for <b>${booking.show.movie.title}</b> was successful!</p>
        <p><b>Seats:</b> ${booking.bookedSeats.join(', ')}</p>
        <p><b>Total:</b> $${booking.amount}</p>
        <p>Enjoy your movie!</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};