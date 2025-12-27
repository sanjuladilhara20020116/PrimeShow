// inngest/index.js
import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDB from "../configs/db.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// CREATE USER
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const name = `${first_name} ${last_name}`;
    const email = email_addresses[0].email_address;

    await User.findByIdAndUpdate(id, { name, email, image: image_url }, { upsert: true });
  }
);

// UPDATE USER
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const name = `${first_name} ${last_name}`;
    const email = email_addresses[0].email_address;

    await User.findByIdAndUpdate(id, { name, email, image: image_url });
  }
);

// DELETE USER
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data; // Clerk sends { id: "user_..." } for deletions
    await User.findByIdAndDelete(id);
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];