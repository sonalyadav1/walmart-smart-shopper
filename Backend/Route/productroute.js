import upload from "../Controllers/multer.js";
// routes/productRoutes.js
import express from "express";
import { ccreateProduct,  getMistralResponse, optimizeProductSelection, updateProductMatrix } from "../Controllers/productController.js";

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

// Updated POST endpoint
router.post('/matrix', async (req, res) => {
    try {
        const { prompt, matrix = [], maxBudget } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const updatedMatrix = await updateProductMatrix(matrix, prompt);
        const { optimizedMatrix, totalCost, withinBudget } = 
            optimizeProductSelection(updatedMatrix, maxBudget);
        
        res.json({
            success: true,
            matrix: optimizedMatrix,
            summary: {
                totalItems: optimizedMatrix.flat().length,
                totalProducts: optimizedMatrix.flat().filter(p => !p.isPlaceholder).length,
                totalCost,
                withinBudget
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to process request",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// POST /api/grocery/suggest
//router.post("/suggest", handleGrocerySuggestion);

router.post("/bulk", ccreateProduct)

export default router;