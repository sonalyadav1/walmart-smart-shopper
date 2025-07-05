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

  // Remove any non-ASCII characters that might break JSON
  content = content.replace(/[^\x20-\x7E]+/g, "");

  console.log("AI Response:", content);

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;

    return { error: "Parsed but not an array", raw: content };
  } catch (err) {
    console.warn("⚠️ Initial JSON parse failed. Attempting recovery...");

    // Try to isolate a valid-looking array
    const start = content.indexOf("[");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("❌ No valid JSON array found.");
      return { error: "No JSON array detected", raw: content };
    }

    let partial = content.slice(start, end + 1);

    // Ensure array ends with a closing bracket
    if (!partial.endsWith("]")) partial += "]";

    try {
      const fixed = JSON.parse(partial);
      if (Array.isArray(fixed)) {
        console.log("✅ Successfully recovered partial JSON.");
        return fixed;
      } else {
        return { error: "Recovered but not an array", raw: partial };
      }
    } catch (err2) {
      console.error("❌ JSON still broken after fixing:\n", partial);
      return { error: "Still invalid after fixing", raw: partial };
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



// ... (keep the existing imports and configurations) ...

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
    bunch: 'bunch', bn: 'bunch',
    loaf: 'unit'  // Added loaf as unit
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

    // Handle compatible units
    if (['g', 'ml', 'kg', 'l'].includes(aiBase.unit) && 
        ['g', 'ml', 'kg', 'l'].includes(productBase.unit)) {
        return Math.max(1, Math.ceil(aiBase.value / productBase.value));
    }
    
    // Handle count-based units
    if (['unit', 'pack', 'bunch', 'loaf'].includes(aiBase.unit) && 
        aiBase.unit === productBase.unit) {
        return Math.max(1, Math.ceil(aiBase.value / productBase.value));
    }
    
    return 1;
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

// Update matrix function with proper grouping and quantity calculation
export const updateProductMatrix = async (matrix, prompt) => {
    try {
        const items = await getMistralResponse(prompt);
        if (!Array.isArray(items)) throw new Error("Invalid AI response");

        // Create a map to track grouped products
        const productGroupMap = new Map();
        
        // Process each item from AI response
        for (const item of items) {
            const groupKey = `${item.name.toLowerCase()}-${item.category.toLowerCase()}`;
            
            // Initialize group if not exists
            if (!productGroupMap.has(groupKey)) {
                productGroupMap.set(groupKey, {
                    itemName: item.name,
                    itemCategory: item.category,
                    products: []
                });
            }
            
            const group = productGroupMap.get(groupKey);
            const products = await findProductsByHashtag(item.name, item.category);
            
            for (const product of products) {
                const requiredCount = calculateRequiredCount(item.quantity, product.quantity);
                const productId = product._id.toString();
                
                // Check if product already exists in group
                const existingProduct = group.products.find(p => p._id.toString() === productId);
                
                if (existingProduct) {
                    // Update existing product
                    existingProduct.requiredCount += requiredCount;
                    existingProduct.totalPrice = existingProduct.basePrice * existingProduct.requiredCount;
                    existingProduct.ingredientSources.push({
                        name: item.name,
                        quantity: item.quantity
                    });
                } else {
                    // Add new product
                    group.products.push({
                        ...product.toObject(),
                        requiredCount,
                        ingredientSources: [{
                            name: item.name,
                            quantity: item.quantity
                        }],
                        basePrice: product.price,
                        totalPrice: product.price * requiredCount
                    });
                }
            }
            
            // Add placeholder if no products found
            if (group.products.length === 0) {
                group.products.push({
                    _id: `unmatched-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    name: item.name,
                    quantity: item.quantity,
                    category: item.category,
                    isPlaceholder: true,
                    requiredCount: 1,
                    ingredientSources: [{
                        name: item.name,
                        quantity: item.quantity
                    }]
                });
            }
        }
        
        // Process groups and add to matrix
        for (const group of productGroupMap.values()) {
            // Sort products by relevance
            group.products.sort((a, b) => {
                if (a.isPlaceholder && !b.isPlaceholder) return 1;
                if (!a.isPlaceholder && b.isPlaceholder) return -1;
                
                // Calculate relevance scores
                const relevanceA = calculateRelevance(
                    { name: group.itemName, category: group.itemCategory },
                    a
                );
                const relevanceB = calculateRelevance(
                    { name: group.itemName, category: group.itemCategory },
                    b
                );
                
                return relevanceB - relevanceA; // Sort descending
            });
            
            // Add group to matrix
            matrix.push(group.products.slice(0, 3));
        }
        
        return matrix;
    } catch (error) {
        console.error("Matrix update error:", error);
        throw error;
    }
};

// Price optimization function with budget enforcement
export const optimizeProductSelection = (matrix, maxBudget) => {
    const optimizedMatrix = [];
    let totalCost = 0;
    let budgetExceeded = false;

    matrix.forEach(group => {
        if (group.length === 0) return;
        
        // Sort by price per base unit
        const sortedGroup = [...group].sort((a, b) => {
            if (a.isPlaceholder || b.isPlaceholder) return 0;
            
            const aBase = convertToBaseUnit(a.quantity).value;
            const bBase = convertToBaseUnit(b.quantity).value;
            
            return (a.price / aBase) - (b.price / bBase);
        });

        // Select most cost-effective option
        const selected = sortedGroup[0];
        
        if (!selected.isPlaceholder) {
            // Check if adding this would exceed budget
            if (maxBudget && (totalCost + selected.totalPrice) > maxBudget) {
                selected.budgetExceeded = true;
                budgetExceeded = true;
            } else {
                totalCost += selected.totalPrice;
            }
        }

        optimizedMatrix.push([selected]);
    });

    return {
        optimizedMatrix,
        totalCost,
        withinBudget: !budgetExceeded
    };
};

// Get all products with optional pagination
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching products",
    });
  }
};

// Search products by name with fuzzy matching  
export const searchProductsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product name is required for search",
      });
    }

    const exactMatches = await Product.find({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (exactMatches.length === 0) {
      const partialMatches = await Product.find({
        name: { $regex: name, $options: "i" },
      });

      if (partialMatches.length === 0) {
        const hashtagMatches = await Product.find({
          hashtags: { $regex: name, $options: "i" },
        });
        return res.status(200).json({
          success: true,
          matchType: "hashtag",
          count: hashtagMatches.length,
          products: hashtagMatches,
        });
      }

      return res.status(200).json({
        success: true,
        matchType: "partial",
        count: partialMatches.length,
        products: partialMatches,
      });
    }

    res.status(200).json({
      success: true,
      matchType: "exact",
      count: exactMatches.length,
      products: exactMatches,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while searching products",
    });
  }
};

export const getUniqueCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      totalCategories: categories.length,
      uniqueCategories: categories,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};