import { StoreMap } from "../Model/mapModel.js";

// Controller/storeMapController.js
export const getStoreMap = async (req, res) => {
  try {
    const storeName = req.query.storeName || "Walmart Superstore - Clean Layout";

    const storeMap = await StoreMap.findOne({ storeName });

    if (!storeMap) {
      return res.status(404).json({ message: `Store map for '${storeName}' not found.` });
    }

    // Calculate dimensions from grid
    const height = storeMap.grid.length;
    const width = storeMap.grid[0]?.length || 0;

    // Enhance category data with additional metadata
    const enhancedCategories = storeMap.categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      position: cat.position,
      size: cat.size,
      shape: cat.shape,
      coordinates: cat.coordinates,
      // Add visual properties for frontend rendering
      color: getCategoryColor(cat.name),
      meta: getCategoryMetadata(cat.name)
    }));

    // Add special areas metadata
    const specialAreas = {
      entrance: storeMap.entrance,
      checkout: storeMap.categories.find(c => c.name === "Checkout Counters")
    };

    res.status(200).json({
      storeName: storeMap.storeName,
      grid: storeMap.grid,
      categories: enhancedCategories,
      dimensions: { width, height },
      specialAreas,
      gridMetadata: {
        values: {
          0: "Walkway",
          1: "Shelf",
          9: "Wall/Border"
        }
      }
    });
  } catch (error) {
    console.error("❌ Failed to fetch store map:", error.message);
    res.status(500).json({ 
      message: "Internal server error while fetching store map.",
      error: error.message
    });
  }
};

// Helper functions remain the same...

// Helper functions
const getCategoryColor = (name) => {
  const colors = {
    "Bakery": "#FFD700",
    "Dairy & Eggs": "#87CEEB",
    "Meat": "#FF6347",
    "Checkout Counters": "#FFA500",
    // Add more colors as needed
  };
  return colors[name] || "#" + Math.floor(Math.random()*16777215).toString(16);
};

const getCategoryMetadata = (name) => {
  const meta = {
    "Bakery": { icon: "🍞", priority: 1 },
    "Dairy & Eggs": { icon: "🥚", temperature: "Chilled" },
    "Meat": { icon: "🍖", temperature: "Frozen" },
    "Checkout Counters": { icon: "💳", type: "ServiceArea" }
  };
  return meta[name] || { icon: "📦" };
};





export const deleteStoreMap = async (req, res) => {
  try {
    const result = await StoreMap.findOneAndDelete({ storeName: "Walmart Superstore" });

    if (!result) {
      return res.status(404).json({ message: "No store map found to delete." });
    }

    res.status(200).json({ message: "Store map deleted successfully." });
  } catch (error) {
    console.error("Error deleting store map:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
