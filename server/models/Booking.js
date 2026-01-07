import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true, ref: "User" },
  show: { type: String, required: true, ref: "Show" },
  amount: { type: Number, required: true },
  bookedSeats: { type: Array, required: true },

  isPaid: { type: Boolean, default: false },
  paymentLink: { type: String },

  expiresAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "expired"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
