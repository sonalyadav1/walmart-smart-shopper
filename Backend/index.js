import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB.js";
import productroute from "./Route/productroute.js";
import upload from "./Controllers/multer.js";
import { seedStoreMap } from "./Controllers/MapController.js";
import { StoreMap } from "./Model/mapModel.js";

import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post("/upload-test", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  res.send(`uploaded: ${req.file.filename}`);
});

// Seed only once
const existingMap = await StoreMap.findOne({ storeName: "Walmart Superstore" });
if (!existingMap) {
  await seedStoreMap();
  console.log("🟢 Store map seeded (first-time only).");
} else {
  console.log("🟡 Store map already exists. Skipping seeding.");
}

app.use("/api", productroute);

// ✅ Call Python script
const pythonScriptPath = path.join(__dirname, "map_generator.py");
execFile("python", [pythonScriptPath], (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Error running Python script:", error);
    return;
  }
  console.log("✅ Python output:", stdout.trim());
});

app.get("/", (req, res) => {
  res.send("Walmart Backend Server Running with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
