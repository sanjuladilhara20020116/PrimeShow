// db.js
import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/primeshow`);
    cachedConnection = conn;
    console.log("Database connected");
    return conn;
  } catch (error) {
    console.error("DB Error:", error.message);
    throw error; // Throw so Inngest knows the function failed
  }
};

export default connectDB;