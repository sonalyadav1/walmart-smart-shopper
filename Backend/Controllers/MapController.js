import { StoreMap } from "../Model/mapModel.js";

export const seedStoreMap = async () => {
  const WIDTH = 220;
  const HEIGHT = 120;
  const WALKWAY = 0;
  const SHELF = 1;
  const BORDER = 9;

  const grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(WALKWAY));
  const categories = [];

  const markCells = (cells) => {
    const coords = [];
    for (const [x, y] of cells) {
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        grid[y][x] = SHELF;
        coords.push([x, y]);
      }
    }
    return coords;
  };

  const drawRect = (x, y, w, h) => {
    const cells = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        cells.push([x + dx, y + dy]);
      }
    }
    return cells;
  };

  const drawL = (x, y, w, h, verticalFirst = true) => {
    const cells = [];
    if (verticalFirst) {
      for (let dy = 0; dy < h; dy++) cells.push([x, y + dy]);
      for (let dx = 1; dx < w; dx++) cells.push([x + dx, y + h - 1]);
    } else {
      for (let dx = 0; dx < w; dx++) cells.push([x + dx, y]);
      for (let dy = 1; dy < h; dy++) cells.push([x, y + dy]);
    }
    return cells;
  };

  const addBorders = () => {
    for (let x = 0; x < WIDTH; x++) {
      grid[0][x] = grid[HEIGHT - 1][x] = BORDER;
    }
    for (let y = 0; y < HEIGHT; y++) {
      grid[y][0] = grid[y][WIDTH - 1] = BORDER;
    }
  };

  const entrance = {
    position: [10, HEIGHT - 10],
    size: [12, 6],
    orientation: "south",
  };

  const checkoutPos = [entrance.position[0] + entrance.size[0] + 4, HEIGHT - 10];
  const checkoutSize = [12, 6];

  const markShelf = (name, coords, shape) => {
    const position = coords[0];
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    const size = [Math.max(...xs) - Math.min(...xs) + 1, Math.max(...ys) - Math.min(...ys) + 1];

    categories.push({
      name,
      position: position,
      size,
      coordinates: coords,
      shape
    });
  };

  const categoryNames = [
    "Freezer", "Beverages - Water", "Coffee - Tea - Cereal", "Baked Goods", "Chips - Condiments",
    "Canned Foods - Grains", "Baking - Spices - Oil", "Dell", "Fruits", "Floral",
    "Seafood", "Salt", "Vegetables", "Bulk", "Veg.", "Dairy & Eggs", "Meat", "Poultry", "Oils",
    "Snacks & Sweets", "Sweets", "Dessert Mix", "Bath & Linen", "Personal Care",
    "Clothing", "Beachwear", "Sportswear", "Footwear", "Accessories", "Sports & Outdoors",
    "Stationery"
  ];

  const startX = 10, startY = 10;
  let x = startX, y = startY;
  let col = 0, row = 0;
  const spacing = 6;
  const rectW = 14, rectH = 6;
  const lW = 10, lH = 6;

  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    let shape, coords;

    if (i % 3 === 0) {
      // L-shaped shelf (vertical first)
      coords = drawL(x, y, lW, lH, true);
      shape = "L-shaped";
    } else {
      // Rectangular shelf
      coords = drawRect(x, y, rectW, rectH);
      shape = "rectangular";
    }

    const placedCoords = markCells(coords);
    markShelf(name, placedCoords, shape);

    x += rectW + spacing;
    col++;

    if (x + rectW + spacing >= WIDTH - 20) {
      x = startX;
      y += rectH + spacing + 4;
      row++;
    }
  }

  // Mark entrance and checkout
  const checkoutCoords = markCells(drawRect(...checkoutPos, ...checkoutSize));
  markShelf("Checkout Counters", checkoutCoords, "rectangular");

  addBorders();

  await StoreMap.create({
    storeName: "Walmart Superstore",
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

  console.log("✅ Seeded store map with 31 shelves in mixed shapes and clear walkways.");
};
