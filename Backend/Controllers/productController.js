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

// Expanded unit conversion with normalization
const UNIT_NORMALIZATION = {
    // Weight
    g: 'g', gram: 'g', grams: 'g',
    kg: 'kg', kilo: 'kg', kilogram: 'kg',
    mg: 'mg',
    
    // Volume
    l: 'l', liter: 'l', litre: 'l', lt: 'l',
    ml: 'ml', milliliter: 'ml',
    
    // Count
    unit: 'unit', piece: 'unit', pc: 'unit', 
    pack: 'pack', packet: 'pack', pkt: 'pack',
    bunch: 'bunch', bn: 'bunch'
};

const convertToBaseUnit = (qtyStr) => {
    if (!qtyStr) return { value: 1, unit: 'unit' };
    
    const match = qtyStr.match(/(\d+(\.\d+)?)\s*(\w+)/);
    if (!match) return { value: 1, unit: 'unit' };

    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase().replace(/s$/, '');
    const normalizedUnit = UNIT_NORMALIZATION[unit] || 'unit';

    const conversionFactors = {
        g: 1,
        kg: 1000,
        mg: 0.001,
        l: 1000,
        ml: 1,
        unit: 1,
        pack: 1,
        bunch: 1
    };

    return {
        value: value * (conversionFactors[normalizedUnit] || 1),
        unit: normalizedUnit
    };
};

// Calculate product relevance score
const calculateRelevance = (item, product) => {
    let score = 0;
    
    // Name similarity
    const nameSimilarity = stringSimilarity.compareTwoStrings(
        item.name.toLowerCase(),
        product.name.toLowerCase()
    );
    score += nameSimilarity * 0.6;

    // Hashtag match
    const hashtags = product.hashtags.split(/\s+/).map(tag => 
        tag.replace('#', '').toLowerCase()
    );
    
    if (hashtags.includes(item.name.toLowerCase())) {
        score += 0.3;
    } else if (hashtags.some(tag => item.name.toLowerCase().includes(tag))) {
        score += 0.2;
    }

    // Category match
    if (product.category.toLowerCase() === item.category.toLowerCase()) {
        score += 0.1;
    }

    return score;
};



// Calculate required product count
const calculateRequiredCount = (aiQuantity, productQuantity) => {
    const aiBase = convertToBaseUnit(aiQuantity);
    const productBase = convertToBaseUnit(productQuantity);

    // Handle compatible units (g/ml)
    if ((aiBase.unit === 'g' || aiBase.unit === 'ml') && 
        (productBase.unit === 'g' || productBase.unit === 'ml')) {
        return Math.max(1, Math.ceil(aiBase.value / productBase.value));
    }
    return aiBase.unit === productBase.unit && productBase.value > 0 ?
        Math.max(1, Math.ceil(aiBase.value / productBase.value)) : 1;
};

// Create product map from matrix
const createProductMap = (matrix) => {
    const productMap = new Map();
    matrix.forEach(row => {
        row.forEach(product => {
            productMap.set(product._id.toString(), product);
        });
    });
    return productMap;
};



// Price optimization function
export const optimizeProductSelection = (matrix, maxBudget) => {
    const optimizedMatrix = [];
    let totalCost = 0;

    matrix.forEach(row => {
        if (row.length === 0) return;
        
        // Sort by price per unit
        const sortedRow = [...row].sort((a, b) => {
            if (a.isPlaceholder || b.isPlaceholder) return 0;
            
            const aBase = convertToBaseUnit(a.quantity).value;
            const bBase = convertToBaseUnit(b.quantity).value;
            
            return (a.price / aBase) - (b.price / bBase);
        });

        // Select most cost-effective option
        const selected = sortedRow[0];
        
        if (!selected.isPlaceholder) {
            totalCost += selected.totalPrice;
            
            // Check budget constraint
            if (maxBudget && totalCost > maxBudget) {
                selected.budgetExceeded = true;
            }
        }

        optimizedMatrix.push([selected]);
    });

    return {
        optimizedMatrix,
        totalCost,
        withinBudget: maxBudget ? totalCost <= maxBudget : true
    };
};



// Enhanced product matching with category-aware search
const findProductsByHashtag = async (itemName, itemCategory) => {
    try {
        const normalizedItemName = itemName.toLowerCase().trim();
        const normalizedCategory = itemCategory.toLowerCase().trim();
        const searchTerms = [
            normalizedItemName,
            ...normalizedItemName.split(/[\s-]+/).filter(term => term.length > 2)
        ];

        // Construct base query with category filter
        const baseQuery = {
            category: { $regex: new RegExp(normalizedCategory, 'i') }
        };

        // 1. First try: Exact name match within category
        const exactMatch = await Product.find({
            ...baseQuery,
            name: { $regex: new RegExp(`^${normalizedItemName}$`, 'i') }
        }).limit(5);

        if (exactMatch.length > 0) {
            console.log(`Exact name match found for "${itemName}" in category "${itemCategory}"`);
            return exactMatch;
        }

        // 2. Second try: Hashtag match within category
        const hashtagConditions = searchTerms.map(term => ({
            hashtags: { $regex: `\\b${term}\\b`, $options: 'i' }
        }));

        const hashtagMatch = await Product.find({
            ...baseQuery,
            $or: hashtagConditions
        }).limit(5);

        if (hashtagMatch.length > 0) {
            console.log(`Hashtag match found for "${itemName}" in category "${itemCategory}"`);
            return hashtagMatch;
        }

        // 3. Third try: Name similarity within category
        const allCategoryProducts = await Product.find(baseQuery);
        const nameMatches = allCategoryProducts.filter(product => {
            const similarity = stringSimilarity.compareTwoStrings(
                normalizedItemName,
                product.name.toLowerCase()
            );
            return similarity >= 0.4;
        });

        if (nameMatches.length > 0) {
            console.log(`Similar name match found for "${itemName}" in category "${itemCategory}"`);
            return nameMatches.slice(0, 5);
        }

        // 4. Fallback: Broad search without category constraint
        console.log(`No matches found for "${itemName}" in category "${itemCategory}". Trying broader search...`);
        return await Product.find({
            $or: [
                { name: { $regex: normalizedItemName, $options: 'i' } },
                ...hashtagConditions
            ]
        }).limit(5);
        
    } catch (error) {
        console.error(`Search failed for "${itemName}":`, error);
        return [];
    }
};

// Update matrix function to use enhanced search
export const updateProductMatrix = async (matrix, prompt) => {
    try {
        const items = await getMistralResponse(prompt);
        if (!Array.isArray(items)) throw new Error("Invalid AI response");

        const productRegistry = new Map();
        matrix.forEach(row => {
            row.forEach(product => {
                productRegistry.set(product._id.toString(), product);
            });
        });

        // Process items with category-aware search
        for (const item of items) {
            const products = await findProductsByHashtag(item.name, item.category);
            const row = [];
            
            for (const product of products) {
                const productId = product._id.toString();
                const requiredCount = calculateRequiredCount(item.quantity, product.quantity);
                
                if (productRegistry.has(productId)) {
                    // Update existing product
                    const existing = productRegistry.get(productId);
                    existing.requiredCount += requiredCount;
                    
                    if (!existing.ingredientSources) {
                        existing.ingredientSources = [{
                            name: item.name,
                            quantity: item.quantity
                        }];
                    } else {
                        existing.ingredientSources.push({
                            name: item.name,
                            quantity: item.quantity
                        });
                    }
                } else {
                    // Create new product entry
                    const newProduct = {
                        ...product.toObject(),
                        requiredCount,
                        ingredientSources: [{
                            name: item.name,
                            quantity: item.quantity
                        }],
                        basePrice: product.price,
                        totalPrice: product.price * requiredCount
                    };
                    row.push(newProduct);
                    productRegistry.set(productId, newProduct);
                }
            }
            
            if (row.length > 0) {
                matrix.push(row);
            } else {
                // Add placeholder with category info
                matrix.push([{
                    _id: `unmatched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.name,
                    quantity: item.quantity,
                    category: item.category,
                    isPlaceholder: true,
                    requiredCount: 1,
                    ingredientSources: [{
                        name: item.name,
                        quantity: item.quantity
                    }]
                }]);
            }
        }
        
        return matrix;
    } catch (error) {
        console.error("Matrix update error:", error);
        throw error;
    }
};