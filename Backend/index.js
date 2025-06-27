import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB.js";
import productroute from "./Route/productroute.js"
import upload from "./Controllers/multer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(cors());
app.use(express.json());

// ✅ Make the uploads folder public (so uploaded files can be accessed via URL)
app.use("/uploads", express.static("uploads"));


app.post("/upload-test", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  res.send(`uploaded: ${req.file.filename}`);
});

app.use("/api", productroute);


app.get("/", (req, res) => {
  res.send("Walmart Backend Server Running with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
