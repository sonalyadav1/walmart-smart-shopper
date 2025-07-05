import { StoreMap } from "../Model/mapModel.js";

export const seedStoreMap = async () => {
  const WIDTH = 200;
  const HEIGHT = 100;
  const WALKWAY = 0;
  const SHELF = 1;
  const BORDER = 9;

  const grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(WALKWAY));
  const categories = [];

  const markShelf = (x, y, w, h) => {
    const coords = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
          grid[py][px] = SHELF;
          coords.push([px, py]);
        }
      }
    }
    return coords;
  };

  const addBorders = () => {
    for (let x = 0; x < WIDTH; x++) {
      grid[0][x] = grid[HEIGHT - 1][x] = BORDER;
    }
    for (let y = 0; y < HEIGHT; y++) {
      grid[y][0] = grid[y][WIDTH - 1] = BORDER;
    }
  };

  // Entrance and Checkout (bottom center)
  const entrance = {
    position: [Math.floor(WIDTH / 2) - 20, HEIGHT - 6],
    size: [12, 6],
    orientation: "south",
  };
  const checkoutPos = [entrance.position[0] + entrance.size[0] + 2, HEIGHT - 6];
  const checkoutSize = [12, 6];

  for (let x = entrance.position[0]; x < entrance.position[0] + entrance.size[0]; x++) {
    for (let y = entrance.position[1]; y < HEIGHT; y++) grid[y][x] = WALKWAY;
  }

  const checkoutCoords = markShelf(checkoutPos[0], checkoutPos[1], ...checkoutSize);
  categories.push({
    name: "Checkout Counters",
    position: checkoutPos,
    size: checkoutSize,
    coordinates: checkoutCoords,
    shape: "rectangular",
  });

  // Define shelves: 4 rows, 5 columns, with walkways
  const startX = 10;
  const startY = 10;
  const shelfWidth = 28;
  const shelfHeight = 8;
  const gapX = 10;
  const gapY = 10;
  const rows = 4;
  const cols = 5;

  const sectionNames = [
  // Row 1
  "Freezer",
  "Beverages - Water",
  "Coffee - Tea - Cereal",
  "Baked Goods",
  "Chips - Condiments",

  // Row 2
  "Canned Foods - Grains",
  "Baking - Spices - Oil",
  "Dell",
  "Fruits",
  "Floral",

  // Row 3
  "Seafood",
  "Salt",
  "Vegetables",
  "Bulk",
  "Veg.",

  // Row 4
  "Vegetables",
  "Dairy & Eggs",
  "Meat",
  "Poultry",
  "Oils",

  // Additional Categories
  "Snacks & Sweets",
  "Sweets",
  "Dessert Mix",
  "Bath & Linen",
  "Personal Care",
  "Clothing",
  "Beachwear",
  "Sportswear",
  "Footwear",
  "Accessories",
  "Sports & Outdoors"
];


  let sectionIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const posX = startX + col * (shelfWidth + gapX);
      const posY = startY + row * (shelfHeight + gapY);

      const coords = markShelf(posX, posY, shelfWidth, shelfHeight);
      categories.push({
        name: sectionNames[sectionIndex] || `Section ${sectionIndex + 1}`,
        position: [posX, posY],
        size: [shelfWidth, shelfHeight],
        coordinates: coords,
        shape: "rectangular"
      });
      sectionIndex++;
    }
  }

  addBorders();

  await StoreMap.deleteMany({});
  await StoreMap.create({
    storeName: "Walmart Superstore - Clean Layout",
    grid,
    categories,
    entrance,
    metadata: {
      width: WIDTH,
      height: HEIGHT,
      values: {
        [WALKWAY]: "Walkway",
        [SHELF]: "Shelf",
        [BORDER]: "Wall/Border"
      }
    }
  });

  console.log("✅ Clean layout seeded with entrance m  emdm dm dm & checkout side-by-side and clear walkways.");
};
