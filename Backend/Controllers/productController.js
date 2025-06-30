import { Product } from "../Model/productModel.js";
import cloudinary from "./cloudinary.js";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import stringSimilarity from "string-similarity"; // you can use this package
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
You are a structured grocery extraction assistant.

Your task is to analyze the user's prompt about cooking dishes, meal plans, or events, and extract a list of necessary ingredients or items in **pure JSON format**. Each entry in the response must follow the structure defined below.

🔶 Respond ONLY with a JSON array. No extra text, explanations, or formatting.

🔸 For each item, provide the following fields:
- "name": string — The core item name (e.g., "atta", "milk", "paneer").
- "quantity": string — Estimated quantity needed (e.g., "2 kg", "1 liter", "500 g", "1 unit").
- "price": number — Approximate market price in INR (minimum 60, integers only).
- "type": string — Must be one of:
  - "food item"
  - "non-food item"
- "dish": string — Name of the dish or context (e.g., "Paneer Butter Masala", "Dish A"). If no dish is specified, use an empty string "".
- "category": string — Must be one of:
  - "vegetable", "fruit", "flour", "dairy", "grocery", "laundry", "dress", "household", "beverage", "bakery"
- "maxbudget": number — Total user budget (INR) for this specific request (repeat for every item)

✅ Rules:
- Always use "type": "food item" for edible grocery ingredients.
- Use "type": "non-food item" for clothing, packaging, appliances, etc.
- Do not include brands, cooking instructions, or any commentary.
- Use realistic per-person estimates. Adjust quantities based on number of people (e.g., 6 people → 1.5 kg chicken).
- Set default price to minimum 60.
- Use user’s total budget as "maxbudget" on each item for further optimization.

❌ Incorrect:
{
  "name": "Spices (turmeric, cumin, coriander)",
  "quantity": "50 g each",
  "price": 100
}

✅ Correct:
[
  { "name": "turmeric", "quantity": "50 g", "price": 60, "type": "food item", "dish": "Dish A", "category": "grocery", "maxbudget": 3000 },
  { "name": "cumin", "quantity": "50 g", "price": 60, "type": "food item", "dish": "Dish A", "category": "grocery", "maxbudget": 3000 }
]

📦 Example Final Response for: “I want to make chicken masala for 6 people under ₹3000”:
[
  { "name": "chicken", "quantity": "1.5 kg", "price": 360, "type": "food item", "dish": "Chicken Masala", "category": "grocery", "maxbudget": 3000 },
  { "name": "onion", "quantity": "500 g", "price": 70, "type": "food item", "dish": "Chicken Masala", "category": "vegetable", "maxbudget": 3000 },
  { "name": "tomato", "quantity": "400 g", "price": 65, "type": "food item", "dish": "Chicken Masala", "category": "vegetable", "maxbudget": 3000 },
  { "name": "ginger garlic paste", "quantity": "100 g", "price": 60, "type": "food item", "dish": "Chicken Masala", "category": "grocery", "maxbudget": 3000 },
  { "name": "garam masala", "quantity": "50 g", "price": 65, "type": "food item", "dish": "Chicken Masala", "category": "grocery", "maxbudget": 3000 },
  { "name": "curd", "quantity": "300 g", "price": 60, "type": "food item", "dish": "Chicken Masala", "category": "dairy", "maxbudget": 3000 }
]

if not specified by user for budget assume from your self as context of the dish and user’s request.

Return strictly only the JSON array.
`.trim()
,
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
  

  console.log("AI Response:", content);
  
  try {
    return JSON.parse(content);
  } catch (err) {
    console.warn("⚠️ Initial JSON parse failed. Attempting recovery...");

    // Try to isolate and truncate to the last valid object in array
    const start = content.indexOf("[");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("❌ No valid JSON structure found.");
      return { error: "No valid JSON detected", raw: content };
    }

    const partial = content.slice(start, end + 1);
    const fixedJson = partial + "]";

    try {
      const parsed = JSON.parse(fixedJson);
      console.log("✅ Successfully recovered partial JSON.");
      return parsed;
    } catch (err2) {
      console.error("❌ JSON still broken after fixing:\n", fixedJson);
      return { error: "Still invalid after fixing", raw: fixedJson };
    }
  }
};





export const ccreateProduct = async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array." });
    }

    const newProducts = [];

    for (const item of products) {
      const {
        name,
        category,
        price,
        description,
        hashtags,
        imageUrl,
        quantity,
      } = item;

      if (
        !name ||
        !category ||
        !price ||
        !description ||
        !hashtags ||
        !imageUrl ||
        !quantity
      ) {
        return res.status(400).json({ message: "Each product must have all required fields." });
      }

      newProducts.push({
        name: name.trim(),
        category: category.trim(),
        price: parseFloat(price),
        description: description.trim(),
        hashtags: hashtags.trim(),
        imageUrl: imageUrl.trim(),
        quantity: quantity.trim(),
      });
    }

    const created = await Product.insertMany(newProducts);
    res.status(201).json({ message: "Products created successfully", products: created });

  } catch (error) {
    console.error("Error creating products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


function parseQuantity(qtyStr) {
  if (!qtyStr) return 0;
  const [value, unit] = qtyStr.trim().toLowerCase().split(" ");
  const val = parseFloat(value);
  if (isNaN(val)) return 0;
  if (unit?.startsWith("kg")) return val * 1000;
  if (unit?.startsWith("g")) return val;
  if (unit?.startsWith("l")) return val * 1000;
  if (unit?.startsWith("ml")) return val;
  if (unit?.includes("unit") || unit?.includes("pack")) return val;
  return val;
}

function mergeAIIngredients(aiList) {
  const map = new Map();
  for (const item of aiList) {
    const key = item.name.toLowerCase();
    if (map.has(key)) {
      const existing = map.get(key);
      existing.count++;
      existing.quantity += parseQuantity(item.quantity);
    } else {
      map.set(key, {
        name: key,
        quantity: parseQuantity(item.quantity),
        price: item.price || 60,
        maxbudget: item.maxbudget || 5000,
        count: 1,
        purpose: item.dish || "General"
      });
    }
  }
  return [...map.values()];
}

async function matchByHashtags(ingredientName, allProducts) {
  const key = ingredientName.toLowerCase();
  return allProducts.filter((p) => {
    if (!p.hashtags || typeof p.hashtags !== "string") return false;
    return p.hashtags.toLowerCase().includes(key);
  });
}

function prioritizeProductVariants(matches, targetQty, maxPrice) {
  return matches
    .map((item) => {
      const q = parseQuantity(item.quantity);
      const price = item.price;
      return {
        ...item.toObject(),
        parsedQty: q,
        deltaQty: Math.abs(targetQty - q),
        deltaPrice: Math.abs(maxPrice - price),
        valuePerRupee: q / price
      };
    })
    .sort((a, b) => {
      return (
        a.deltaQty - b.deltaQty ||
        a.deltaPrice - b.deltaPrice ||
        b.valuePerRupee - a.valuePerRupee ||
        a.price - b.price
      );
    });
}

function cleanProduct(product) {
  const {
    _id, name, price, quantity, category, description, hashtags,
    imageUrl, parsedQty, deltaQty, deltaPrice, valuePerRupee, count
  } = product;

  return {
    _id, name, price, quantity, category, description, hashtags,
    imageUrl, parsedQty, deltaQty, deltaPrice, valuePerRupee, count
  };
}

export const handleGrocerySuggestion = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt must be a valid string." });
    }

    const aiResponse = await getMistralResponse(prompt);
    if (!Array.isArray(aiResponse)) {
      return res.status(500).json({ error: "Invalid AI response", raw: aiResponse });
    }

    const mergedIngredients = mergeAIIngredients(aiResponse);
    const allProducts = await Product.find({});
    const matrix = [];

    for (const ing of mergedIngredients) {
      const matches = await matchByHashtags(ing.name, allProducts);
      const prioritized = prioritizeProductVariants(matches, ing.quantity, ing.price);
      if (prioritized.length) {
        prioritized[0].count = ing.count;
      }
      matrix.push(prioritized); // even if empty
    }

    const cleanedMatrix = matrix.map(group => group.map(cleanProduct));
    return res.status(200).json({ matrix: cleanedMatrix });
  } catch (err) {
    console.error("❌ handleGrocerySuggestion error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
