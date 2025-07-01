import upload from "../Controllers/multer.js";
// routes/productRoutes.js
import express from "express";
import { ccreateProduct,  getMistralResponse, handleGrocerySuggestion } from "../Controllers/productController.js";

const router = express.Router();

// @route   POST /products
// @desc    Create a new product with image upload
//router.post("/products", upload.single("file"), createProduct);

router.post("/generate-products", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const result = await getMistralResponse(prompt);
    if (result.error) return res.status(500).json(result);

    res.json({ products: result });
  } catch (err) {
    console.error("❌ Error generating products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// POST /api/grocery/suggest
router.post("/suggest", handleGrocerySuggestion);

router.post("/bulk", ccreateProduct)

export default router;
