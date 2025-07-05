import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./connectDB.js";
import productroute from "./Route/productroute.js"
import upload from "./Controllers/multer.js";
import {seedStoreMap} from "./Controllers/MapController.js";
import { StoreMap } from "./Model/mapModel.js";


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


// Call seeding function ONCE if map not already present
    const existingMap = await StoreMap.findOne({ storeName: "Walmart Superstore" });
    if (!existingMap) {
      await seedStoreMap();  // seed it only once
      console.log("🟢 Store map seeded (first-time only).");
    } else {
      console.log("🟡 Store map already exists. Skipping seeding.");
    }

app.use("/api", productroute);




app.get("/", (req, res) => {
  res.send("Walmart Backend Server Running with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
