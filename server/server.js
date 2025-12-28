import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";



const app = express();
const port = 3000;

await connectDB();

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => res.send("Server is live"));

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
