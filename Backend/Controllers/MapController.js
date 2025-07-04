import { StoreMap } from "../Model/mapModel.js";

// Increased dimensions to accommodate more categories
const STORE_NAME = "Walmart Superstore";
const WIDTH = 220;
const HEIGHT = 100;
const SHELF_HEIGHT = 3;
const SHELF_DEPTH = 2;
const AISLE_WIDTH = 8;  // Wider aisles for better navigation
const START_X = 10;
const START_Y = 10;
const BORDER_VALUE = 9;
const SHELF_VALUE = 1;
const WALKWAY_VALUE = 0;

// Enhanced category layout with all 31 categories - NO U-SHAPED SHELVES
const categoryLayout = [
  // Fresh produce
  { name: "Fruits", shape: "circular" },
  { name: "Vegetables", shape: "circular" },
  
  // Food categories
  { name: "Bakery", shape: "circular" },
  { name: "Dairy", shape: "rectangular" },  // Changed from U-shaped
  { name: "Dairy & Eggs", shape: "rectangular" },  // Changed from U-shaped
  { name: "Meat", shape: "rectangular" },
  { name: "Poultry", shape: "rectangular" },
  { name: "Oils", shape: "rectangular" },
  { name: "Grains", shape: "rectangular" },
  { name: "Grains & Flours", shape: "rectangular" },
  { name: "Snacks & Sweets", shape: "L-shaped" },
  { name: "Sweets", shape: "L-shaped" },
  { name: "Dessert Mix", shape: "rectangular" },
  { name: "Beverages", shape: "rectangular" },
  { name: "Condiments", shape: "rectangular" },
  { name: "Spices", shape: "rectangular" },
  { name: "Herbs & Spices", shape: "rectangular" },
  { name: "Canned Foods", shape: "rectangular" },  // Changed from U-shaped
  { name: "Ready to Eat", shape: "rectangular" },
  { name: "Ready to Cook", shape: "L-shaped" },
  
  // Household & grocery
  { name: "Groceries", shape: "rectangular" },
  { name: "Utensils", shape: "L-shaped" },
  
  // Personal care
  { name: "Bath & Linen", shape: "rectangular" },  // Changed from U-shaped
  { name: "Personal Care", shape: "rectangular" },  // Changed from U-shaped
  
  // Clothing & accessories
  { name: "Clothing", shape: "rectangular" },  // Changed from U-shaped
  { name: "Beachwear", shape: "L-shaped" },
  { name: "Sportswear", shape: "L-shaped" },
  { name: "Footwear", shape: "L-shaped" },
  { name: "Accessories", shape: "L-shaped" },
  { name: "Fashion Accessories", shape: "L-shaped" },
  
  // Other categories
  { name: "Sports & Outdoors", shape: "L-shaped" },
  { name: "Travel Essentials", shape: "rectangular" }
];

// Helper function to mark shelf positions
const markShelf = (grid, position, size) => {
  const [x, y] = position;
  const [w, h] = size;
  
  for (let i = y; i < y + h; i++) {
    for (let j = x; j < x + w; j++) {
      if (i < HEIGHT && j < WIDTH) {
        grid[i][j] = SHELF_VALUE;
      }
    }
  }
};

// Generate coordinates for different shelf shapes
const generateShelfCoordinates = (position, size, shape) => {
  const [x, y] = position;
  const [w, h] = size;
  const coords = [];
  
  // Only handle rectangular, L-shaped, and circular - remove U-shaped logic
  switch(shape) {
    case "rectangular":
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          coords.push([x + dx, y + dy]);
        }
      }
      break;
      
    case "L-shaped":
      // Horizontal part
      for (let dy = 0; dy < SHELF_HEIGHT; dy++) {
        for (let dx = 0; dx < w; dx++) {
          coords.push([x + dx, y + dy]);
        }
      }
      // Vertical part
      for (let dy = SHELF_HEIGHT; dy < h; dy++) {
        for (let dx = 0; dx < SHELF_DEPTH; dx++) {
          coords.push([x + w - SHELF_DEPTH + dx, y + dy]);
        }
      }
      break;
      
    case "circular":
      // Simplified circular shape (actually octagonal)
      const centerX = x + w/2;
      const centerY = y + h/2;
      const radius = Math.min(w, h) / 2 - 1;
      
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          const dist = Math.sqrt(Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2));
          if (dist <= radius && dist >= radius - SHELF_DEPTH) {
            coords.push([j, i]);
          }
        }
      }
      break;
  }
  
  return coords;
};

// Add borders to the grid
const addBorders = (grid) => {
  for (let i = 0; i < WIDTH; i++) {
    grid[0][i] = BORDER_VALUE;
    grid[HEIGHT - 1][i] = BORDER_VALUE;
  }
  for (let j = 0; j < HEIGHT; j++) {
    grid[j][0] = BORDER_VALUE;
    grid[j][WIDTH - 1] = BORDER_VALUE;
  }
};

// Add entrance to the grid
const addEntrance = (grid) => {
  const entranceSize = [10, 10];
  const entrancePos = [(WIDTH - entranceSize[0]) / 2, HEIGHT - 15];
  
  for (let y = entrancePos[1]; y < entrancePos[1] + entranceSize[1]; y++) {
    for (let x = entrancePos[0]; x < entrancePos[0] + entranceSize[0]; x++) {
      if (y < HEIGHT && x < WIDTH) grid[y][x] = WALKWAY_VALUE;
    }
  }
  
  return { position: entrancePos, size: entranceSize };
};

// Add checkout counters
const addCheckout = (grid, categories) => {
  const checkoutSize = [40, 6];
  const checkoutPos = [WIDTH - 50, HEIGHT - 15];
  
  markShelf(grid, checkoutPos, checkoutSize);
  
  const checkoutCategory = {
    name: "Checkout Counters",
    position: checkoutPos,
    size: checkoutSize,
    coordinates: generateShelfCoordinates(checkoutPos, checkoutSize, "rectangular"),
    shape: "rectangular"
  };
  
  categories.push(checkoutCategory);
  return checkoutCategory;
};

const seedStoreMap = async () => {
 

  const grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(WALKWAY_VALUE));
  const categories = [];
  
  // Calculate positions with proper spacing
  let currentX = START_X;
  let currentY = START_Y;
  let rowHeight = 0;
  
  // Group categories by type for better organization
  const categoryGroups = [
    // Fresh produce at front
    categoryLayout.filter(cat => ["Fruits", "Vegetables"].includes(cat.name)),
    // Food categories
    categoryLayout.filter(cat => [
      "Bakery", "Dairy", "Dairy & Eggs", "Meat", "Poultry", "Oils", 
      "Grains", "Grains & Flours", "Snacks & Sweets", "Sweets",
      "Dessert Mix", "Beverages", "Condiments", "Spices", "Herbs & Spices",
      "Canned Foods", "Ready to Eat", "Ready to Cook"
    ].includes(cat.name)),
    // Household & personal care
    categoryLayout.filter(cat => [
      "Groceries", "Utensils", "Bath & Linen", "Personal Care"
    ].includes(cat.name)),
    // Clothing & accessories
    categoryLayout.filter(cat => [
      "Clothing", "Beachwear", "Sportswear", "Footwear", 
      "Accessories", "Fashion Accessories"
    ].includes(cat.name)),
    // Other categories
    categoryLayout.filter(cat => [
      "Sports & Outdoors", "Travel Essentials"
    ].includes(cat.name))
  ];

  // Place category groups in different sections
  for (const group of categoryGroups) {
    // Reset position for new group
    currentX = START_X;
    currentY += rowHeight + AISLE_WIDTH * 2;
    rowHeight = 0;
    
    for (const cat of group) {
      const shape = cat.shape;
      let shelfWidth, shelfHeightDim;
      
      // Define dimensions based on shape
      switch(shape) {
        case "L-shaped":
          shelfWidth = 28;
          shelfHeightDim = 16;
          break;
        case "circular":
          shelfWidth = 22;
          shelfHeightDim = 22;
          break;
        default: // rectangular
          shelfWidth = 24;
          shelfHeightDim = 10;
      }
      
      // Move to next row if needed
      if (currentX + shelfWidth > WIDTH - START_X) {
        currentX = START_X;
        currentY += rowHeight + AISLE_WIDTH;
        rowHeight = 0;
      }
      
      // Update row height
      rowHeight = Math.max(rowHeight, shelfHeightDim);
      
      // Position and size
      const position = [currentX, currentY];
      const size = [shelfWidth, shelfHeightDim];
      
      // Generate coordinates
      const coords = generateShelfCoordinates(position, size, shape);
      
      // Mark shelf in grid
      if (shape === "circular") {
        for (const [x, y] of coords) {
          if (y < HEIGHT && x < WIDTH) grid[y][x] = SHELF_VALUE;
        }
      } else {
        markShelf(grid, position, size);
      }
      
      categories.push({
        name: cat.name,
        position,
        size,
        coordinates: coords,
        shape
      });
      
      // Move to next position with spacing
      currentX += shelfWidth + AISLE_WIDTH;
    }
  }
  
  // Add borders
  addBorders(grid);
  
  // Add checkout counters
  const checkout = addCheckout(grid, categories);
  
  // Add entrance at bottom center
  const entrance = addEntrance(grid);
  
  // Create store map
  await StoreMap.create({
    storeName: STORE_NAME,
    grid,
    categories,
    entrance,
    metadata: {
      width: WIDTH,
      height: HEIGHT,
      values: {
        [WALKWAY_VALUE]: "Walkway",
        [SHELF_VALUE]: "Shelf",
        [BORDER_VALUE]: "Wall/Border"
      }
    }
  });

  console.log("✅ Store map seeded: Enhanced layout with 31 categories (no U-shapes).");
};

export default seedStoreMap;