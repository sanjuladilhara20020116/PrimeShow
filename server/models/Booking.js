import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  amount: { type: Number, required: true },
  bookedSeats: [{ type: String }],
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);