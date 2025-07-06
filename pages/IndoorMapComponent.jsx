// 'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrthographicCamera, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

const CATEGORY_TO_SHELF = {
  "Dairy": "Dairy & Eggs",
  "Dairy & Eggs": "Dairy & Eggs",
  "Eggs": "Dairy & Eggs",
  "Meat": "Meat",
  "Chicken": "Meat",
  "Poultry": "Poultry",
  "Fish": "Seafood",
  "Seafood": "Seafood",
  "Vegetables": "Vegetables",
  "Veg.": "Veg.",
  "Bulk": "Bulk",
  "Fruits": "Fruits",
  "Floral": "Floral",
  "Grains": "Canned Foods - Grains",
  "Grains & Flours": "Canned Foods - Grains",
  "Rice": "Canned Foods - Grains",
  "Baking": "Baking - Spices - Oil",
  "Spices": "Baking - Spices - Oil",
  "Oils": "Oils",
  "Ready to Cook": "Baking - Spices - Oil",
  "Snacks": "Snacks & Sweets",
  "Snacks & Sweets": "Snacks & Sweets",
  "Sweets": "Sweets",
  "Desserts": "Dessert Mix",
  "Dessert Mix": "Dessert Mix",
  "Bakery": "Baked Goods",
  "Baked Goods": "Baked Goods",
  "Bread": "Baked Goods",
  "Cereal": "Coffee - Tea - Cereal",
  "Coffee": "Coffee - Tea - Cereal",
  "Tea": "Coffee - Tea - Cereal",
  "Water": "Beverages - Water",
  "Beverages": "Beverages - Water",
  "Chips": "Chips - Condiments",
  "Condiments": "Chips - Condiments",
  "Canned": "Canned Foods - Grains",
  "Canned Foods": "Canned Foods - Grains",
  "Dell": "Dell",
  "Salt": "Salt",
  "Personal Care": "Personal Care",
  "Bath": "Bath & Linen",
  "Bath & Linen": "Bath & Linen",
  "Linen": "Bath & Linen",
  "Clothing": "Clothing",
  "Beachwear": "Beachwear",
  "Sportswear": "Sportswear",
  "Footwear": "Footwear",
  "Accessories": "Accessories",
  "Sports & Outdoors": "Sports & Outdoors",
  "Stationery": "Stationery",
  // Add more as needed
};

// --- PATHFINDING LOGIC ---
const StoreMap = ({
  setSelectedCategory,
  viewMode,
  pathProducts,
  groupedProducts,
  showOptimizedPath
}) => {
  const foodCategories = [
  "Freezer", "Beverages - Water", "Coffee - Tea - Cereal", "Baked Goods", "Chips - Condiments",
  "Canned Foods - Grains", "Baking - Spices - Oil", "Dell", "Fruits", "Floral",
  "Seafood", "Salt", "Vegetables", "Bulk", "Veg.", "Dairy & Eggs", "Meat", "Poultry", "Oils",
  "Snacks & Sweets", "Sweets", "Dessert Mix"
];

const miscCategories = [
  "Bath & Linen", "Personal Care", "Clothing", "Beachwear", "Sportswear", "Footwear",
  "Accessories", "Sports & Outdoors", "Stationery"
];
  const shelfColors = ['#7dd3fc', '#fca5a5', '#fcd34d', '#a5b4fc', '#86efac', '#f9a8d4', '#fde68a', '#c4b5fd', '#6ee7b7', '#fda4af'];

 const foodPositions = [
[-69, 2, -20], [-39, 2, -20], [-12, 2, -20], [39, 2, -20],
[69, 2, -20], [-69, 2, -8], [-39, 2, -8], [-12, 2, -8],
[39, 2, -8], [69, 2, -8], [-69, 2, 2], [-39, 2, 2],
[-12, 2, 2], [39, 2, 2], [69, 2, 2], [-69, 2, 12], [-39, 2, 12], [-12, 2, 12], [39, 2, 12], [69, 2, 12],[69, 2, 22], [-39, 2, 22], [-12, 2, 22], [39, 2, 22], [69, 2, 22]
];

const miscPositions = [
[-60, 2, 40], [-40, 2, 40], [-20, 2, 40], [0, 2, 30], [20, 2, 30],
[-60, 2, 58], [-40, 2, 58], [-20, 2, 58], [0, 2, 50], [20, 2, 53]
];

  // Create refs for all shelves to add hover effects
  const shelfRefs = useRef([]);
  const lineRef = useRef();

  // Highlight categories with products in the path
  const highlightedCategories = Object.keys(groupedProducts);

  // 1. Map constants
  const GRID_SIZE = 4; // 1 cell = 4 units
  const MAP_WIDTH = 400;
  const MAP_HEIGHT = 350;
  const GRID_COLS = Math.ceil(MAP_WIDTH / GRID_SIZE);
  const GRID_ROWS = Math.ceil(MAP_HEIGHT / GRID_SIZE);

  // 2. Utility: Convert world pos to grid cell
  function worldToGrid([x, , z]) {
    // Map world coords to grid indices (0,0 at top-left)
    const gx = Math.floor((x + MAP_WIDTH / 2) / GRID_SIZE);
    const gz = Math.floor((z + MAP_HEIGHT / 2) / GRID_SIZE);
    return [gx, gz];
  }
  // 3. Utility: Convert grid cell to world pos (center)
  function gridToWorld([gx, gz], y = 5) {
    const x = gx * GRID_SIZE - MAP_WIDTH / 2 + GRID_SIZE / 2;
    const z = gz * GRID_SIZE - MAP_HEIGHT / 2 + GRID_SIZE / 2;
    return [x, y, z];
  }

  // 4. Build obstacles grid (all shelf positions)
  const shelfObstacles = useMemo(() => {
    const obstacles = new Set();
    // Food shelves
    // Food shelves
// Food shelves
foodPositions.forEach(pos => {
  const [gx, gz] = worldToGrid(pos);
  obstacles.add(`${gx},${gz}`); // Only the center cell
});
// Misc shelves
miscPositions.forEach(pos => {
  const [gx, gz] = worldToGrid(pos);
  obstacles.add(`${gx},${gz}`);
});
    // Special Offers
    const [gx, gz] = worldToGrid([60, 2, -40]);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++)
      obstacles.add(`${gx+dx},${gz+dz}`);
    // Checkout
    const [cgx, cgz] = worldToGrid([10, 3, -60]);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -1; dz <= 1; dz++)
      obstacles.add(`${cgx+dx},${cgz+dz}`);
    // Entrance
    const [egx, egz] = worldToGrid([0, 0.5, 65]);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -1; dz <= 1; dz++)
      obstacles.add(`${egx+dx},${egz+dz}`);
    return obstacles;
  }, []);

  console.log("Obstacle cells:", Array.from(shelfObstacles));

  // 5. A* pathfinding
  function astar(start, goal, obstacles) {
    const [sx, sz] = start, [gx, gz] = goal;
    const key = ([x, z]) => `${x},${z}`;
    const open = [[sx, sz]];
    const cameFrom = {};
    const gScore = { [key([sx, sz])]: 0 };
    const fScore = { [key([sx, sz])]: Math.abs(gx - sx) + Math.abs(gz - sz) };
    while (open.length) {
      open.sort((a, b) => (fScore[key(a)] ?? 1e9) - (fScore[key(b)] ?? 1e9));
      const [cx, cz] = open.shift();
      if (cx === gx && cz === gz) {
        let curr = key([gx, gz]), path = [[gx, gz]];
        while (cameFrom[curr]) {
          path.push(cameFrom[curr]);
          curr = key(cameFrom[curr]);
        }
        return path.reverse();
      }
      for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= GRID_COLS || nz >= GRID_ROWS) continue;
        if (obstacles.has(`${nx},${nz}`)) continue;
        const neighbor = [nx, nz];
        const nkey = key(neighbor);
        const tentative_g = (gScore[key([cx, cz])] ?? 1e9) + 1;
        if (tentative_g < (gScore[nkey] ?? 1e9)) {
          cameFrom[nkey] = [cx, cz];
          gScore[nkey] = tentative_g;
          fScore[nkey] = tentative_g + Math.abs(gx - nx) + Math.abs(gz - nz);
          if (!open.some(([x, z]) => x === nx && z === nz)) open.push(neighbor);
        }
      }
    }
    return [];
  }

  // Simple route optimization (nearest neighbor algorithm)
  const optimizeRoute = (waypoints) => {
    if (waypoints.length <= 3) return waypoints;
    const optimized = [waypoints[0]];
    const remaining = [...waypoints.slice(1, -1)];
    const checkout = waypoints[waypoints.length - 1];
    let current = optimized[0];
    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      remaining.forEach((point, idx) => {
        const dist = distanceBetween(current, point);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });
      current = remaining[nearestIdx];
      optimized.push(current);
      remaining.splice(nearestIdx, 1);
    }
    optimized.push(checkout);
    return optimized;
  };

  // Calculate distance between two points
  const distanceBetween = (a, b) => {
    return Math.sqrt(
      Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
    );
  };
const pathPoints = useMemo(() => {
    if (!showOptimizedPath || !pathProducts.length) return [];
    // 1. Group products by category and get unique categories
    const categories = Object.keys(groupedProducts);
    if (!categories.length) return [];
    // 2. Map categories to their shelf positions
    const allCategories = [...foodCategories, ...miscCategories, 'Special Offers 🎯'];
    const allPositions = [...foodPositions, ...miscPositions, [60, 2, -40]];
    // 3. Find positions for each category in the shopping list
    const categoryPositions = categories.map(cat => {
        const mappedCat = CATEGORY_TO_SHELF[cat] || cat;
        const categoryWithEmoji = allCategories.find(c => c === mappedCat);
        if (!categoryWithEmoji) {
            console.warn("No shelf match for category:", cat, "mapped as", mappedCat);
            return null;
        }
        const index = allCategories.indexOf(categoryWithEmoji);
        return allPositions[index];
    }).filter(Boolean);

    // Debug logs
    console.log("Grouped products:", groupedProducts);
    console.log("Categories:", categories);
    console.log("Mapped categories:", categories.map(cat => CATEGORY_TO_SHELF[cat] || cat));
    console.log("Category positions:", categoryPositions);

    if (!categoryPositions.length) {
        console.warn("No category positions found for path!");
        return [];
    }
    // 4. Create waypoints: entrance -> categories -> checkout
    const waypoints = [
      [0, 5, 170], // Entrance
      ...categoryPositions.map(([x, , z]) => [x, 5, z]),
      [10, 5, -150] // Checkout
    ];

    // 5. Find the optimal order to visit categories (Traveling Salesman Problem approximation)
    const optimizedWaypoints = optimizeRoute(waypoints);

    // 6. Convert to grid coordinates
    const gridWaypoints = optimizedWaypoints.map(worldToGrid);

    // 7. Find path between each pair of waypoints
    let fullPath = [];
    for (let i = 0; i < gridWaypoints.length - 1; i++) {
  const start = gridWaypoints[i];
  const end = gridWaypoints[i+1];
  // Remove start and end from obstacles for this segment
  const startKey = `${start[0]},${start[1]}`;
  const endKey = `${end[0]},${end[1]}`;
  const tempObstacles = new Set(shelfObstacles);
  tempObstacles.delete(startKey);
  tempObstacles.delete(endKey);

  const segment = astar(start, end, tempObstacles);
  if (!segment.length) {
    console.warn("No path segment between", start, "and", end);
    continue;
  }
  if (i > 0) segment.shift();
  fullPath.push(...segment);
}

    // 8. Convert grid path to world positions
    const result = fullPath.map(cell => {
      const [x, y, z] = gridToWorld(cell, 5);
      return new THREE.Vector3(x, y, z);
    });

    console.log("Final pathPoints:", result);
    return result;
}, [pathProducts, shelfObstacles, groupedProducts, showOptimizedPath]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    highlightedCategories.forEach(category => {
      const allCategories = [...foodCategories, ...miscCategories];
      const index = allCategories.findIndex(cat => cat.includes(category));
      if (index !== -1 && shelfRefs.current[index]) {
        const intensity = Math.sin(time * 2) * 0.1 + 0.3;
        shelfRefs.current[index].material.emissiveIntensity = intensity;
      }
    });
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.7 + Math.sin(time) * 0.3;
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]}>
      <boxGeometry args={[MAP_WIDTH, 0.15, MAP_HEIGHT]} />
      <meshStandardMaterial color="#f8fafc" />
    </mesh>
    {/* Pathways */}
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[MAP_WIDTH - 50, MAP_HEIGHT - 150]} />
      <meshStandardMaterial color="#e2e8f0" />
    </mesh>
    {/* Main Aisle */}
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, MAP_HEIGHT - 50]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
    {/* Entrance */}
    <mesh position={[0, 0.5, 170]}>
      <boxGeometry args={[30, 1, 8]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
    {/* Checkout */}
    <mesh position={[10, 3, -150]}>
      <boxGeometry args={[35, 1, 8]} />
      <meshStandardMaterial color="#f87171" />
    </mesh>
      {/* Path visualization */}
      {showOptimizedPath && pathProducts.length > 0 && pathPoints.length > 1 && (
        <group>
          <line ref={lineRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={pathPoints.length}
                array={new Float32Array(pathPoints.flatMap(v => [v.x, v.y, v.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#3b82f6"
              linewidth={4}
              transparent
              opacity={0.7}
            />
          </line>
          {pathPoints.map((point, index) => (
            <mesh key={index} position={point} visible={index > 0 && index < pathPoints.length - 1}>
              <sphereGeometry args={[1.5, 16, 16]} />
              <meshStandardMaterial
                color="#3b82f6"
                emissive="#60a5fa"
                emissiveIntensity={0.8}
              />
              {index === 0 && (
                <Text
                  position={[0, 3, 0]}
                  fontSize={1.5}
                  color="#1e293b"
                  anchorX="center"
                >
                  START
                </Text>
              )}
              {index === pathPoints.length - 1 && (
                <Text
                  position={[0, 3, 0]}
                  fontSize={1.5}
                  color="#1e293b"
                  anchorX="center"
                >
                  CHECKOUT
                </Text>
              )}
            </mesh>
          ))}
        </group>
      )}
      {/* Food Shelves */}
      {foodCategories.map((cat, i) => {
        const isHighlighted = highlightedCategories.some(c => cat.includes(c));
        return (
          <mesh
            key={cat}
            position={foodPositions[i]}
            onClick={() => setSelectedCategory(cat)}
            ref={el => shelfRefs.current[i] = el}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <boxGeometry args={[19, viewMode === '2D' ? 0.1 : 4, 7]} />
            <meshStandardMaterial
              color={isHighlighted ? '#93c5fd' : shelfColors[i % shelfColors.length]}
              emissive={isHighlighted ? '#dbeafe' : '#000000'}
              emissiveIntensity={isHighlighted ? 0.3 : 0}
              roughness={0.3}
            />
            <Text
              position={[0, viewMode === '2D' ? 1 : 3, 0]}
              fontSize={1}
              color="#1e293b"
              rotation={viewMode === '2D' ? [-Math.PI/2, 0, 0] : [0, 0, 0]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#ffffff"
            >
              {cat}
            </Text>
          </mesh>
        );
      })}
      {/* Misc Shelves */}
      {miscCategories.map((cat, i) => {
        const idx = foodCategories.length + i;
        const isHighlighted = highlightedCategories.some(c => cat.includes(c));
        return (
          <mesh
            key={cat}
            position={miscPositions[i]}
            onClick={() => setSelectedCategory(cat)}
            ref={el => shelfRefs.current[idx] = el}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <boxGeometry args={[5, viewMode === '2D' ? 0.1 : 4, 16]} />
            <meshStandardMaterial
              color={isHighlighted ? '#93c5fd' : shelfColors[(i + 5) % shelfColors.length]}
              emissive={isHighlighted ? '#dbeafe' : '#000000'}
              emissiveIntensity={isHighlighted ? 0.3 : 0}
              roughness={0.3}
            />
            <Text
              position={[0, viewMode === '2D' ? 1 : 3, 0]}
              fontSize={1}
              color="#1e293b"
              rotation={viewMode === '2D' ? [-Math.PI/2, 0, 0] : [0, 0, 0]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#ffffff"
            >
              {cat}
            </Text>
          </mesh>
        );
      })}
      {/* Special Offers Section */}
      <mesh position={[60, 2, -40]} onClick={() => setSelectedCategory('Special Offers 🎯')}>
        <cylinderGeometry args={[8, 8, viewMode === '2D' ? 0.1 : 4, 32]} />
        <meshStandardMaterial color="#fcd34d" />
        <Text
          position={[0, viewMode === '2D' ? 1 : 3, 0]}
          fontSize={1.2}
          color="#1e293b"
          rotation={viewMode === '2D' ? [-Math.PI/2, 0, 0] : [0, 0, 0]}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#ffffff"
        >
          Special Offers 🎯
        </Text>
      </mesh>
    </group>
  );
};

const LegendItem = ({ color, label, emoji }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '0.75rem',
    borderRadius: '0.75rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{
      width: '1.5rem',
      height: '1.5rem',
      marginRight: '0.75rem',
      borderRadius: '0.5rem',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1e293b',
      fontWeight: '600'
    }}>
      {emoji}
    </div>
    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#334155' }}>{label}</span>
  </div>
);

const ShoppingComplexMap = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('3D');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef(null);
  const [pathProducts, setPathProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [showProductsList, setShowProductsList] = useState(true);
  const [showOptimizedPath, setShowOptimizedPath] = useState(false);
  const router = useRouter();

  const toggleViewMode = () => {
    setViewMode(viewMode === '3D' ? '2D' : '3D');
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setTimeout(() => setSelectedCategory(null), 300);
  };

  // Load path products from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem("pathProductsDetails");
    if (storedProducts) {
      const products = JSON.parse(storedProducts);
      setPathProducts(products);

      // Group by product.category
      const grouped = {};
      products.forEach(product => {
        const category = product.category;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(product);
      });
      setGroupedProducts(grouped);
    }
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        closePopup();
      }
    };
    if (isPopupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupVisible]);

  const handleFindMoreProducts = () => {
    router.push("/");
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <header style={{
        width: '100%',
        maxWidth: '1140px',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          Grand Shopping Complex
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={toggleViewMode}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: viewMode === '3D' ? '#4f46e5' : '#10b981',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              {viewMode === '3D' ? '🌐 2D View' : '🔍 3D View'}
            </span>
          </button>
          <button
            onClick={handleFindMoreProducts}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#f97316',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🛒 Find More Products</span>
          </button>
        </div>
      </header>
      <div style={{
        width: '100%',
        display: 'flex',
        gap: '1.5rem',
        height: 'calc(100vh - 150px)'
      }}>
        {/* Map container - shifted to left */}
        <div style={{
          flex: 1,
          height: '100%',
          backgroundColor: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isPopupVisible && selectedCategory && (
            <div
              ref={popupRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                minWidth: '320px',
                maxWidth: '500px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.3s ease-out',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>
                {selectedCategory.split(' ').pop()}
              </div>
              <h3 style={{
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '0.75rem',
                fontSize: '1.5rem'
              }}>
                {selectedCategory}
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                fontSize: '1.05rem'
              }}>
                Explore the best deals and top products in this section! Our {selectedCategory.split(' ')[0]} aisle features premium selections at competitive prices.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={closePopup}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>View Details</span>
                </button>
                <button
                  onClick={closePopup}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    fontWeight: '600',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          <button
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 10,
              padding: '0.7rem 1.5rem',
              background: showOptimizedPath ? '#3b82f6' : '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onClick={() => setShowOptimizedPath(v => !v)}
          >
            {showOptimizedPath ? 'Hide Optimized Path' : 'Show Optimized Path'}
          </button>
          <Canvas shadows camera={{ position: [0, 60, 100], fov: 60 }}>
            {viewMode === '2D' ? (
              <OrthographicCamera makeDefault zoom={8} position={[0, 120, 0]} />
            ) : (
              <PerspectiveCamera makeDefault fov={60} position={[0, 60, -90]} />
            )}
            <ambientLight intensity={0.6} />
            <directionalLight position={[50, 100, 50]} intensity={1} castShadow />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={viewMode === '3D'}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 2.5}
              minAzimuthAngle={viewMode === '3D' ? -Math.PI / 2 : -Infinity}
              maxAzimuthAngle={viewMode === '3D' ? Math.PI / 2 : Infinity}
            />
            <StoreMap
              setSelectedCategory={handleCategoryClick}
              viewMode={viewMode}
              pathProducts={pathProducts}
              groupedProducts={groupedProducts}
              showOptimizedPath={showOptimizedPath}
            />
          </Canvas>
        </div>
        {/* Products list container - on the right */}
        <div style={{
          width: '320px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          height: '100%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
              Your Shopping Path
            </h3>
            <button
              onClick={() => setShowProductsList(!showProductsList)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {showProductsList ? 'Hide' : 'Show'} List
            </button>
          </div>
          {Object.keys(groupedProducts).length > 0 ? (
            showProductsList && (
              <div style={{ marginTop: '1rem' }}>
                {Object.entries(groupedProducts).map(([category, products]) => (
                  <div key={category} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#4f46e5',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e5e7eb',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{category}</span>
                    </h4>
                    <ul style={{ listStyle: 'none', paddingLeft: '0.5rem' }}>
                      {products.map((product, idx) => (
                        <li key={idx} style={{
                          padding: '0.5rem 0',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>{product.name || product.productName}</span>
                          {product.quantity && (
                            <span style={{
                              backgroundColor: '#dbeafe',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.8rem'
                            }}>
                              {product.quantity}x
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              marginTop: '1rem'
            }}>
              <p style={{ color: '#0284c7', marginBottom: '1rem' }}>
                No products in your path yet
              </p>
              <button
                onClick={handleFindMoreProducts}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#38bdf8',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Find Products
              </button>
            </div>
          )}
        </div>
      </div>
      <footer style={{
        width: '100%',
        maxWidth: '1140px',
        marginTop: '1.5rem',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🗺️</span> Store Map Legend
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <LegendItem color="#4ade80" label="Entrance/Exit" emoji="🚪" />
          <LegendItem color="#f87171" label="Checkout" emoji="💳" />
          <LegendItem color="#e5e7eb" label="Pathways" emoji="🚶" />
          <LegendItem color="#60a5fa" label="Product Sections" emoji="🛒" />
          <LegendItem color="#3b82f6" label="Shopping Path" emoji="🔷" />
          <LegendItem color="#fcd34d" label="Special Offers" emoji="🎯" />
        </div>
      </footer>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f3f4f6;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        button {
          transition: all 0.2s ease;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        button:active {
          transform: translateY(1px);
        }
      `}</style>
    </div> );
};

export default ShoppingComplexMap;