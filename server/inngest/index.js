import { Inngest } from "inngest";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "movie-ticket-booking",
});

// CREATE USER
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("CREATE EVENT:", event.data);

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    await User.create({
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    });
  }
);

// DELETE USER
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("DELETE EVENT:", event.data);

    await User.findByIdAndDelete(event.data.id);
  }
);

// UPDATE USER
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    console.log("UPDATE EVENT:", event.data);

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    await User.findByIdAndUpdate(id, {
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];
