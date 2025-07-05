'use client';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Enhanced Dijkstra's algorithm with better pathfinding
const dijkstra = (grid, start, end) => {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // Create visited matrix and distance matrix
  const visited = Array(rows).fill().map(() => Array(cols).fill(false));
  const distances = Array(rows).fill().map(() => Array(cols).fill(Infinity));
  const prev = Array(rows).fill().map(() => Array(cols).fill(null));
  
  // 4-direction movement (up, right, down, left)
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  // Priority queue: [row, col, distance]
  const queue = [];
  
  // Initialize start position
  distances[start[1]][start[0]] = 0;
  queue.push([start[1], start[0], 0]);
  
  while (queue.length > 0) {
    // Sort queue by distance (priority queue)
    queue.sort((a, b) => a[2] - b[2]);
    const [r, c, dist] = queue.shift();
    
    // Skip if already visited
    if (visited[r][c]) continue;
    visited[r][c] = true;
    
    // Check if reached destination
    if (r === end[1] && c === end[0]) break;
    
    // Explore neighbors
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      
      // Check bounds and walkability
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0) {
        const newDist = dist + 1;
        
        if (newDist < distances[nr][nc]) {
          distances[nr][nc] = newDist;
          prev[nr][nc] = [r, c];
          queue.push([nr, nc, newDist]);
        }
      }
    }
  }
  
  // Reconstruct path if exists
  const path = [];
  let [r, c] = [end[1], end[0]];
  
  // Check if path exists
  if (prev[r][c] === null) {
    console.error(`No path found from [${start}] to [${end}]`);
    return [];
  }
  
  // Reconstruct path backwards
  while (r !== start[1] || c !== start[0]) {
    path.push([c, r]); // [x, y]
    [r, c] = prev[r][c];
  }
  
  path.push([start[0], start[1]]);
  return path.reverse();
};

// Improved path calculation
const computeFullPath = (data, categories) => {
  if (!data.specialAreas?.entrance) return;
  
  const entrance = data.specialAreas.entrance.position;
  const checkout = data.specialAreas.checkout?.position;
  let fullPath = [];
  
  // Start from entrance
  let currentPoint = entrance;
  
  // Visit each category in order
  for (const category of categories) {
    const center = getCenter(category);
    
    // Calculate path to this category
    const segment = dijkstra(data.grid, currentPoint, center);
    
    if (segment.length > 0) {
      // Add segment to full path (skip first point to avoid duplicate)
      fullPath = fullPath.concat(segment.slice(1));
      currentPoint = center;
    } else {
      console.error(`No path to category: ${category.name} at [${center}]`);
    }
  }
  
  // Add path to checkout if exists
  if (checkout) {
    const checkoutSegment = dijkstra(data.grid, currentPoint, checkout);
    if (checkoutSegment.length > 0) {
      fullPath = fullPath.concat(checkoutSegment.slice(1));
    }
  }
  
  console.log("Full path points:", fullPath);
  setPathPoints(fullPath);
};

const EnhancedStoreMap = () => {
  // Refs and state declarations
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const pathLineRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const gridLayerRef = useRef(null);
  const markersRef = useRef([]);
  const popupsRef = useRef([]);

  const [mapData, setMapData] = useState(null);
  const [pathPoints, setPathPoints] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/map");
        const data = await res.json();
        setMapData(data);

        const storedProducts = JSON.parse(localStorage.getItem("pathProductsDetails")) || [];
        const storedProductNames = JSON.parse(localStorage.getItem("pathProducts")) || [];

        const grouped = {};
        storedProducts.forEach(product => {
          const color = data.categories?.find(c => c.name === product.category)?.color || '#a1887f';
          if (!grouped[product.category]) {
            grouped[product.category] = { category: product.category, products: [], color };
          }
          grouped[product.category].products.push(product);
        });

        setGroupedProducts(Object.values(grouped));
        
        // Compute full path for all categories
        if (data.categories && data.specialAreas) {
          const categoriesToVisit = data.categories.filter(cat => 
            storedProductNames.includes(cat.name)
          );
          computeFullPath(data, categoriesToVisit);
        }
      } catch (err) {
        setError("Failed to load store map. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation effect
  useEffect(() => {
    if (isNavigating && currentStep < pathPoints.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setProgress(Math.floor(((currentStep + 1) / pathPoints.length) * 100));
      }, 100); // Faster animation
      return () => clearTimeout(timer);
    } else if (currentStep >= pathPoints.length - 1) {
      setIsNavigating(false);
    }
  }, [isNavigating, currentStep, pathPoints]);

  useEffect(() => {
    if (!mapData || !mapData.grid || mapInstance.current) return;

    const gridWidth = mapData.grid[0].length;
    const gridHeight = mapData.grid.length;

    const bounds = L.latLngBounds([0, 0], [gridHeight * 10, gridWidth * 10]);

    mapInstance.current = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 2,
      zoomControl: false,
    });

    mapInstance.current.fitBounds(bounds);
    setTimeout(() => mapInstance.current.invalidateSize(), 300);

    gridLayerRef.current = L.layerGroup().addTo(mapInstance.current);
    drawGrid(mapData.grid);
    addCategoryLabels(mapData.categories);
    addSpecialAreas(mapData.specialAreas);
  }, [mapData]);

  useEffect(() => {
    if (!mapData || !mapInstance.current || pathPoints.length === 0) return;

    if (pathLineRef.current) pathLineRef.current.remove();
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const latLngs = pathPoints.map(([x, y]) => L.latLng(y * 10 + 5, x * 10 + 5));
    pathLineRef.current = L.polyline(latLngs, { 
      color: '#4285f4', 
      weight: 3,
      dashArray: '5, 10'
    }).addTo(mapInstance.current);

    // Add markers for each category in the path
    const categories = mapData.categories.filter(cat => 
      groupedProducts.some(group => group.category === cat.name)
    );
    
    categories.forEach(category => {
      const center = getCenter(category);
      const marker = L.marker(L.latLng(center[1] * 10 + 5, center[0] * 10 + 5), {
        icon: L.divIcon({
          className: 'category-marker',
          html: `<div style="background-color:${category.color}">${category.name}</div>`,
          iconSize: [120, 40]
        })
      }).addTo(mapInstance.current);
      markersRef.current.push(marker);
    });

    updateCurrentPosition();
  }, [pathPoints])
  
  
  // Add this temporary debug code
const testPath = dijkstra(mapData.grid, [1,1], [5,5]);
console.log("Test path:", testPath);;

  // Optimized path calculation to visit all categories
  const computeFullPath = (data, categories) => {
    if (!data.specialAreas?.entrance) return;
    
    const entrance = data.specialAreas.entrance.position;
    const checkout = data.specialAreas.checkout?.position;
    let fullPath = [];
    
    // Start from entrance
    let currentPoint = entrance;
    
    // Visit each category in order
    for (const category of categories) {
      const center = getCenter(category);
      
      // Only calculate path if we're not already at the center
      if (currentPoint[0] !== center[0] || currentPoint[1] !== center[1]) {
        const segment = dijkstra(data.grid, currentPoint, center);
        
        if (segment.length > 0) {
          // Add this segment to the full path (skip first point to avoid duplicate)
          fullPath = [...fullPath, ...segment.slice(1)];
          currentPoint = center;
        }
      }
    }
    
    // Add path to checkout if exists
    if (checkout && (currentPoint[0] !== checkout[0] || currentPoint[1] !== checkout[1])) {
      const checkoutSegment = dijkstra(data.grid, currentPoint, checkout);
      if (checkoutSegment.length > 0) {
        fullPath = [...fullPath, ...checkoutSegment.slice(1)];
      }
    }
    
    console.log("Full path points:", fullPath);
    setPathPoints(fullPath);
  };

  const startNavigation = () => {
    if (pathPoints.length > 0) {
      setCurrentStep(0);
      setIsNavigating(true);
      setProgress(0);
    }
  };

  const getCenter = ({ position, size }) => [
    Math.floor(position[0] + size[0] / 2),
    Math.floor(position[1] + size[1] / 2)
  ];

  const updateCurrentPosition = () => {
    currentMarkerRef.current?.remove();

    if (currentStep >= pathPoints.length) return;

    const [x, y] = pathPoints[currentStep];
    const marker = L.marker(L.latLng(y * 10 + 5, x * 10 + 5), {
      icon: L.divIcon({
        className: 'user-marker',
        html: '<div class="user-icon">📍</div>',
        iconSize: [30, 30]
      })
    }).addTo(mapInstance.current);
    
    currentMarkerRef.current = marker;
    mapInstance.current.panTo(marker.getLatLng());
  };

  const drawGrid = (grid) => {
    if (!mapInstance.current || !gridLayerRef.current) return;

    gridLayerRef.current.clearLayers();
    const colors = {
      1: ['#d1bc9a', '#a1887f'],  // Shelves
      0: ['#f8f9fa', '#e0e0e0'],  // Walkways
      9: ['#a0a0a0', '#707070']   // Obstacles
    };

    // Only draw visible area for performance
    const visibleRows = Math.min(100, grid.length);
    const visibleCols = Math.min(200, grid[0].length);
    
    for (let y = 0; y < visibleRows; y++) {
      for (let x = 0; x < visibleCols; x++) {
        const cell = grid[y][x];
        if (!colors[cell]) continue;
        
        const [fillColor, strokeColor] = colors[cell];
        const bounds = L.latLngBounds(
          L.latLng(y * 10, x * 10),
          L.latLng((y + 1) * 10, (x + 1) * 10)
        );

        const rect = L.rectangle(bounds, {
          color: strokeColor,
          fillColor: fillColor,
          fillOpacity: 1,
          weight: 1
        });

        gridLayerRef.current.addLayer(rect);
      }
    }
  };

  const addCategoryLabels = (categories) => {
    if (!categories || !mapInstance.current) return;
    
    // Clear previous popups
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];
    
    categories.forEach(category => {
      const center = getCenter(category);
      const centerLatLng = L.latLng(center[1] * 10, center[0] * 10);
      
      // Create category label
      const label = L.marker(centerLatLng, {
        icon: L.divIcon({
          className: 'category-label',
          html: `<div style="background-color:${category.color}">${category.name}</div>`,
          iconSize: [120, 40]
        }),
        zIndexOffset: 1000
      }).addTo(mapInstance.current);

      markersRef.current.push(label);
      
      // Create popup content
      const popupContent = `
        <div class="category-popup">
          <h4>${category.name}</h4>
          <div class="shelf-info">
            <span class="shelf-color" style="background-color:${category.color}"></span>
            Size: ${category.size[0]}x${category.size[1]} units
          </div>
        </div>
      `;
      
      // Create and bind popup
      const popup = L.popup({ className: 'custom-popup' })
        .setLatLng(centerLatLng)
        .setContent(popupContent);
      
      label.bindPopup(popup);
      popupsRef.current.push(popup);
    });
  };

  const addSpecialAreas = (areas) => {
    if (!areas || !mapInstance.current) return;

    const addRect = (areaName, color, position, size) => {
      const bounds = L.latLngBounds(
        L.latLng(position[1] * 10, position[0] * 10),
        L.latLng(position[1] * 10 + size[1] * 10, position[0] * 10 + size[0] * 10)
      );

      const rect = L.rectangle(bounds, {
        color,
        fillColor: color,
        fillOpacity: 0.5
      }).addTo(mapInstance.current);

      markersRef.current.push(rect);
      
      // Add label
      const center = [
        position[0] + size[0] / 2,
        position[1] + size[1] / 2
      ];
      
      const areaLabel = L.marker(L.latLng(center[1] * 10, center[0] * 10), {
        icon: L.divIcon({
          className: 'special-label',
          html: `<div>${areaName}</div>`,
          iconSize: [100, 30]
        })
      }).addTo(mapInstance.current);
      
      markersRef.current.push(areaLabel);
    };

    if (areas.entrance) addRect("Entrance", "#34a853", areas.entrance.position, areas.entrance.size);
    if (areas.checkout) addRect("Checkout", "#ea4335", areas.checkout.position, areas.checkout.size);
  };

  return (
    <div className="store-map-container">
      <h1 className="text-2xl font-bold text-center mb-4">Walmart Indoor Navigator</h1>
      
      {error && <p className="error-alert">{error}</p>}
      {loading && <p className="loading-indicator">Loading store map...</p>}
      
      <div className="dashboard-layout">
        <div className="map-section">
          <div ref={mapRef} className="leaflet-map" />
          
          <div className="navigation-controls">
            <button 
              onClick={startNavigation} 
              disabled={isNavigating || pathPoints.length === 0}
              className="nav-button"
            >
              {isNavigating ? 'Navigating...' : 'Start Full Navigation'}
            </button>
            
            {isNavigating && (
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="progress-text">{progress}%</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="products-section">
          <h2 className="product-header">Your Shopping List</h2>
          
          {groupedProducts.length > 0 ? (
            <div className="category-list">
              {groupedProducts.map((group, index) => {
                const category = mapData?.categories?.find(c => c.name === group.category);
                return (
                  <div 
                    key={index} 
                    className={`category-group ${activeCategory?.name === group.category ? 'active-category' : ''}`}
                  >
                    <h3 className="category-title" style={{ backgroundColor: group.color }}>
                      {group.category}
                    </h3>
                    <ul className="product-list">
                      {group.products.map((product, idx) => (
                        <li key={idx} className="product-item">
                          <span className="product-name">{product.name}</span>
                          <span className="product-location">Aisle {product.aisle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-products">No products added to your list</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoreMap;