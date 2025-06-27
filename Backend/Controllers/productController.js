import { Product } from "../Model/productModel.js";
import cloudinary from "./cloudinary.js";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();



const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Using Together.ai endpoint
});


export const getMistralResponse = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: `
You are a grocery assistant.

Your job is to extract the necessary **grocery ingredients** from the user's message describing a dish, meal plan, or event. The response must be in **valid raw JSON format**, containing **only** ingredients with quantity and price.

❗Instructions:
- Respond ONLY with a raw **JSON array**.
- Do NOT include brand names or company names.
- Do NOT include dish names — return only ingredients required to make them.
- Do NOT include markdown, text, or explanations of any kind.
- Each item must include:
  - "name": string (e.g., "paneer", "rice")
  - "quantity": string (e.g., "1 kg", "500 g", "2 liters", "1 unit", "1 pack")
  - "price": number (in INR, no currency symbol)

📌 Rules:
- If you cannot determine quantity, use "1 unit" or "1 pack".
- If you cannot estimate price, use 0 — but try to estimate realistically.
- Do NOT return price less than 60 for any item.
- Do NOT combine multiple ingredients in one object.
  ❌ Incorrect:
  {
    "name": "Spices (cumin, coriander, turmeric)",
    "quantity": "50 g each",
    "price": 100
  }

  ✅ Correct:
  [
    { "name": "cumin", "quantity": "50 g", "price": 20 },
    { "name": "coriander", "quantity": "50 g", "price": 20 },
    { "name": "turmeric", "quantity": "50 g", "price": 20 }
  ]

✅ Final expected format:
[
  { "name": "milk", "quantity": "2 liters", "price": 70 },
  { "name": "paneer", "quantity": "500 g", "price": 160 }
]

Strictly return only the JSON array. No extra commentary or text.

        `.trim(),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  let content = response.choices[0].message.content.trim();

  try {
    return JSON.parse(content);
  } catch (err) {
    // Try to fix if JSON is incomplete
    if (!content.endsWith("]")) {
      content += "]";
    }

    try {
      return JSON.parse(content);
    } catch (err2) {
      console.error("❌ AI still returned invalid JSON:\n", content);
      return { error: "Invalid JSON format", raw: content };
    }
  }
};


export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, hashtags, quantity } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const filePath = req.file.path;

    // 1. Upload to Cloudinary from file path
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });

    // 2. Remove local file after upload
    fs.unlinkSync(filePath);

    // 3. Create product document
    const product = new Product({
      name,
      category,
      price,
      description,
      quantity,
      hashtags: hashtags?.split(",").map((tag) => tag.trim()),
      imageUrl: result.secure_url, // Add this in your model if not added
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("❌ Product creation failed:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};





// ----------- Quantity Parser ----------- //
function parseQuantity(qtyStr) {
  if (!qtyStr) return 0;
  const [value, unit] = qtyStr.trim().toLowerCase().split(" ");
  const val = parseFloat(value);

  if (isNaN(val)) return 0;
  if (unit.startsWith("kg")) return val * 1000;
  if (unit.startsWith("g")) return val;
  if (unit.startsWith("l")) return val * 1000;
  if (unit.startsWith("ml")) return val;
  if (unit.includes("unit") || unit.includes("pack")) return val;

  return val;
}

// ----------- Match & Prioritize ----------- //
function prioritizeProducts(products, targetQty, maxPrice) {
  return products
    .map((p) => {
      const parsedQty = parseQuantity(p.quantity);
      const qtyDiff = Math.abs(parsedQty - targetQty);
      return {
        _id: p._id,
        name: p.name,
        price: p.price || 0,
        quantity: p.quantity || "1 unit",
        imageUrl: p.imageUrl || "",
        description: p.description || "",
        category: p.category || "",
        hashtags: p.hashtags || [],
        qtyDiff,
        parsedQty,
      };
    })
    .filter(p => p.parsedQty <= targetQty && p.price <= maxPrice)
    .sort((a, b) => {
      if (a.qtyDiff !== b.qtyDiff) return a.qtyDiff - b.qtyDiff;
      return a.price - b.price;
    })
    .slice(0, 3) // Return top 3 matches
    .map(({ qtyDiff, parsedQty, ...rest }) => rest); // Remove internal sorting helpers
}

// ----------- Main Matcher ----------- //
export const matchAIProductsToInventory = async (aiProducts) => {
  const matrix = [];

  for (const item of aiProducts) {
    const { name, quantity, price } = item;
    const targetQty = parseQuantity(quantity);

   const matches = await Product.find({
  hashtags: { $regex: new RegExp(`\\b${name}\\b`, "i") },
});


    if (!matches.length) {
      matrix.push([]); // No product found
      continue;
    }

    const bestMatches = prioritizeProducts(matches, targetQty, price);
    matrix.push(bestMatches);
  }

  return matrix;
};





export const handleGrocerySuggestion = async (req, res) => {
  try {
    const { prompt, matrix: existingMatrix } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required and must be a string." });
    }

    // 1. Get JSON product list from AI
    const aiResponse = await getMistralResponse(prompt);

    if (!Array.isArray(aiResponse)) {
      return res.status(500).json({ error: "AI response is not a valid product list.", raw: aiResponse });
    }

    // 2. Match products to inventory
    const newMatrix = await matchAIProductsToInventory(aiResponse);

    // 3. If previous matrix was sent, append to it
    let finalMatrix;
    if (Array.isArray(existingMatrix)) {
      finalMatrix = [...existingMatrix, ...newMatrix];
    } else {
      finalMatrix = newMatrix;
    }

    return res.status(200).json({ matrix: finalMatrix });

  } catch (error) {
    console.error("❌ Error in handleGrocerySuggestion:", error.message);
    return res.status(500).json({ error: "Something went wrong while handling grocery suggestion." });
  }
};
