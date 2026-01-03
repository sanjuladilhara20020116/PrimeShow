// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "https://avatar.iran.liara.run/public" },
    // Added field
    favorites: [{ type: String, ref: 'Movie' }] 
});

const User = mongoose.model('User', userSchema);
export default User;