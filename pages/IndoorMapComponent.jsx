'use client';

import {
  MapContainer,
  Rectangle,
  Polyline,
  Marker,
  Tooltip,
  Polygon,
  useMap
} from 'react-leaflet';
import { useEffect, useState, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// HARDCODED STORE DIMENSIONS
const STORE_WIDTH = 400;
const STORE_HEIGHT = 500;

function SetViewOnPoint({ point, zoom, allowUserInteraction, autoNavigate }) {
  const map = useMap();

  useEffect(() => {
    if (!point || allowUserInteraction || !autoNavigate) return;

    const timer = setTimeout(() => {
      map.flyToBounds(L.latLngBounds([point, point]), {
        padding: L.point(50, 50),
        maxZoom: zoom,
        duration: 1,
        easeLinearity: 0.25,
      });
    }, 300);


    console.log("Auto-flying to", point, "autoNavigate =", autoNavigate, "allowUserInteraction =", allowUserInteraction);

    return () => clearTimeout(timer);
  }, [point, zoom, allowUserInteraction, autoNavigate]);

  return null;
}


const startPoint = [3, 3];

const IndoorMapComponent = () => {
  // State and refs
  const [mapData, setMapData] = useState(null);
  const [productList, setProductList] = useState([]);
  const [path, setPath] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const [allowUserInteraction, setAllowUserInteraction] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);


  // Fetch map data
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/map');
        const data = await response.json();
        setMapData(data);
        
        const detailed = JSON.parse(localStorage.getItem('pathProductsDetails')) || [];
        const validProducts = detailed.flat().filter(p => p && p.name && p.category);
        setProductList(validProducts);
      } catch (err) {
        console.error('❌ Map fetch failed:', err);
        setError('Failed to load store map data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMapData();
  }, []);

  // Fly to current point when index changes - MODIFIED
  useEffect(() => {
    if (path.length > 0 && currentIndex < path.length) {
      const nextPoint = path[currentIndex];
      
      // Only update if point actually changed
      if (!currentPoint || 
          nextPoint[0] !== currentPoint[0] || 
          nextPoint[1] !== currentPoint[1]) {
        setCurrentPoint(nextPoint);
        setCurrentZoom(2);
       setAllowUserInteraction(prev => {
  // Only disable if it's not already disabled
  if (prev) return false;
  return prev;
});

      }
    }
  }, [currentIndex, path, currentPoint]); // Added currentPoint dependency

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups = {};
    
    productList.forEach(product => {
      if (!groups[product.category]) {
        groups[product.category] = {
          category: product.category,
          products: []
        };
      }
      groups[product.category].products.push(product);
    });
    
    return Object.values(groups);
  }, [productList]);

  // Process selected categories with validation
  const selectedCategories = useMemo(() => {
    if (!mapData || !mapData.categories || !Array.isArray(mapData.categories)) return [];
    
    return mapData.categories.filter(cat => 
      groupedProducts.some(group => group.category === cat.name) &&
      cat.position && 
      cat.size
    );
  }, [mapData, groupedProducts]);

  // Create optimized path with coordinate validation
  const optimizedPath = useMemo(() => {
    if (!mapData || !mapData.grid || selectedCategories.length === 0) return [];
    
    const points = [startPoint];
    
    for (const cat of selectedCategories) {
      const x = Math.floor(cat.position[0] + cat.size[0]/2);
      const y = Math.floor(cat.position[1] + cat.size[1]/2);
      
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push([x, y]);
      }
    }
    
    return points.map(([x, y]) => [y + 0.5, x + 0.5]);
  }, [mapData, selectedCategories]);




const hasAutoNavigated = useRef(false);





  // Update path when optimizedPath changes
useEffect(() => {
  if (optimizedPath.length > 0) {
    setPath(optimizedPath);
    setCurrentIndex(0);

    if (autoNavigate) {
      setCurrentPoint(optimizedPath[0]);  // ✅ only fly if autoNavigate still true
      setCurrentZoom(5);
      setAllowUserInteraction(false);
    }
  }
}, [optimizedPath, mapReady, autoNavigate]);



  useEffect(() => {
  if (
    autoNavigate &&
    path.length > 0 &&
    currentIndex < path.length
  ) {
    setCurrentPoint(path[currentIndex]);
    setCurrentZoom(2);
    setAllowUserInteraction(false);
  }
}, [currentIndex, path, autoNavigate]);



  const lastInteractionRef = useRef(Date.now());

// Attach event once when map is ready
useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  const handleMoveStart = () => {
    lastInteractionRef.current = Date.now();
    setAllowUserInteraction(true);
    setAutoNavigate(false); // 🛑 Prevent future auto re-centering
  };

  map.on('movestart', handleMoveStart);

  // Clean up
  return () => {
    map.off('movestart', handleMoveStart);
  };
}, [mapReady]);


useEffect(() => {
  console.log("autoNavigate is now:", autoNavigate);
}, [autoNavigate]);


// Auto-disable interaction after 2 seconds of inactivity
useEffect(() => {
  const timeout = setTimeout(() => {
    const now = Date.now();
    const diff = now - lastInteractionRef.current;

    if (diff > 2000) {
     // setAllowUserInteraction(false);
    }
  }, 2000); // Run this after 2s

  return () => clearTimeout(timeout);
}, [currentIndex]);



  // Navigation handlers
  const handleNextPoint = () => {
    if (currentIndex >= path.length - 1) return;
 setAllowUserInteraction(prev => {
  // Only disable if it's not already disabled
  if (prev) return false;
  return prev;
});
    // setAutoNavigate(true);
    setCurrentIndex(prev => Math.min(prev + 1, path.length - 1));
  };

  const handlePrevPoint = () => {
    if (currentIndex <= 0) return;
   setAllowUserInteraction(prev => {
  // Only disable if it's not already disabled
  if (prev) return false;
  return prev;
});
    //setAutoNavigate(true);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  // Render grid efficiently
  const renderGrid = () => {
    if (!mapData || !mapData.grid) return null;
    
    return mapData.grid.map((row, y) => 
      row.map((cell, x) => {
        if (cell === 1) { // Shelf
          return (
            <Rectangle
              key={`shelf-${x}-${y}`}
              bounds={[[y, x], [y+1, x+1]]}
              pathOptions={{ 
                fillColor: '#a1887f', 
                color: '#5d4037', 
                fillOpacity: 0.7 
              }}
            />
          );
        } 
        return null;
      })
    );
  };



  // Loading and error states
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading store map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Use HARDCODED dimensions as fallback
  const width = mapData?.dimensions?.width || STORE_WIDTH;
  const height = mapData?.dimensions?.height || STORE_HEIGHT;

  return (
    <div className="map-dashboard">
      <div className="map-controls">
        <h2 className="map-title">Store Navigation</h2>
        <div className="navigation-controls">
          <button 
            className="nav-btn prev-btn" 
            onClick={handlePrevPoint}
            disabled={currentIndex <= 0}
          >
            ◀ Previous
          </button>
          <div className="path-progress">
            Step {currentIndex + 1} of {path.length}
          </div>
          <button 
            className="nav-btn next-btn" 
            onClick={handleNextPoint}
            disabled={currentIndex >= path.length - 1}
          >
            Next ▶
          </button>
        </div>
      </div>
      
      <div className="map-wrapper">
        <MapContainer
  center={[height / 2, width / 2]}
  zoom={3}
  crs={L.CRS.Simple}
  minZoom={1}
  maxZoom={5}
  maxBounds={[[0, 0], [height, width]]}
  className="store-map"
  scrollWheelZoom={true}        // ✅ allow zoom with mouse wheel
  dragging={true}               // ✅ allow map dragging
  doubleClickZoom={true}        // ✅ allow double click zoom
  boxZoom={true}                // ✅ allow box zoom
  keyboard={true}               // ✅ allow keyboard control
  touchZoom={true}              // ✅ allow pinch-to-zoom
  whenCreated={(map) => {
    mapRef.current = map;
    setMapReady(true);
  }}
>

          {/* Auto-scroll component */}
          {currentPoint && (
            <SetViewOnPoint 
    point={currentPoint} 
    zoom={currentZoom} 
    allowUserInteraction={allowUserInteraction}
    autoNavigate={autoNavigate} // ✅ PASS IT HERE
  />
          )}

          {/* HARDCODED BOUNDARY RECTANGLE */}
          <Rectangle
            bounds={[[0, 0], [400, width]]}
            pathOptions={{ 
              color: '#000', 
              weight: 5, 
              fillOpacity: 0,
              dashArray: "5, 5"
            }}
          />

          {/* Render grid */}
          {renderGrid()}

          {/* Render checkout counters */}
          {mapData?.specialAreas?.checkout && (
            <Polygon
              positions={mapData.specialAreas.checkout.coordinates.map(([x, y]) => [y, x])}
              pathOptions={{
                fillColor: mapData.specialAreas.checkout.color || '#FFA500',
                color: '#000',
                weight: 3, // Bolder border
                fillOpacity: 0.8,
              }}
            >
              <Tooltip permanent>Checkout Counters</Tooltip>
            </Polygon>
          )}

          {/* Render categories with bolder borders */}
          {mapData?.categories?.map((cat, index) => {
            if (!cat.coordinates || cat.coordinates.length === 0) return null;
            
            const color = cat.color || '#c2dfff';
            const isHighlighted = groupedProducts.some(p => p.category === cat.name);
            const icon = cat.meta?.icon || '📦';

            return (
              <Polygon
                key={`cat-${index}`}
                positions={cat.coordinates.map(([x, y]) => [y, x])}
                pathOptions={{
                  fillColor: color,
                  color: isHighlighted ? '#000' : '#333',
                  weight: isHighlighted ? 4 : 3, // Bolder borders
                  fillOpacity: isHighlighted ? 0.9 : 0.7,
                }}
              >
                <Tooltip 
                  direction="center" 
                  permanent 
                  opacity={1}
                  className={`category-tooltip ${isHighlighted ? 'highlighted' : ''}`}
                >
                  <div className="tooltip-content" style={{ 
                    backgroundColor: color,
                    fontWeight: 'bold',
                    fontSize: '1.1em'
                  }}>
                    <span className="category-icon">{icon}</span> {cat.name}
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}
          
          {/* Render navigation path */}
          {path.length > 1 && path.every(p => p[0] !== undefined && p[1] !== undefined) && (
            <>
              <Polyline
                positions={path}
                pathOptions={{ 
                  color: '#4285F4', 
                  weight: 5, // Thicker path
                  dashArray: '8, 8',
                  lineCap: 'round'
                }}
              />
              {path[0] && (
                <Marker 
                  position={path[0]} 
                  icon={L.divIcon({
                    className: 'start-marker',
                    html: '<div>START</div>',
                    iconSize: [70, 35],
                    iconAnchor: [35, 17],
                  })}
                />
              )}
              {path[path.length - 1] && (
                <Marker 
                  position={path[path.length - 1]} 
                  icon={L.divIcon({
                    className: 'end-marker',
                    html: '<div>END</div>',
                    iconSize: [70, 35],
                    iconAnchor: [35, 17],
                  })}
                />
              )}
              {path[currentIndex] && (
                <Marker 
                  position={path[currentIndex]} 
                  icon={L.divIcon({
                    className: 'current-marker',
                    html: `<div class="pulse">${currentIndex + 1}</div>`,
                    iconSize: [35, 35],
                    iconAnchor: [17, 17],
                  })}
                />
              )}
            </>
          )}
        </MapContainer>

        <div className="product-drawer">
          <h3 className="product-drawer-title">
            <span className="cart-icon">🛒</span> 
            Your Shopping Path
            <span className="item-count">{productList.length} items</span>
          </h3>
          <div className="product-list">
            {groupedProducts.map((group, groupIndex) => {
              const category = mapData?.categories?.find(c => c.name === group.category);
              const color = category?.color || '#c2dfff';
              const icon = category?.meta?.icon || '📦';
              
              // Find if this category is the current step
              const isCurrent = path[currentIndex] && 
                currentIndex < path.length &&
                group.category === selectedCategories[groupIndex]?.name;
              
              return (
                <div 
                  key={groupIndex} 
                  className={`group-card ${isCurrent ? 'active' : ''}`}
                  onClick={() => {
  const catIndex = selectedCategories.findIndex(cat => cat.name === group.category);
  if (catIndex !== -1) {
   // setAutoNavigate(true); // ✅ again
    setCurrentIndex(catIndex + 1);
  }
}}

                  style={{ 
                    borderLeft: `5px solid ${color}`,
                    backgroundColor: isCurrent ? '#f0f7ff' : 'white'
                  }}
                >
                  <div className="group-header">
                    <div className="group-icon">{icon}</div>
                    <div className="group-info">
                      <strong className="group-category" style={{ color }}>
                        {group.category}
                      </strong>
                      <div className="group-count">
                        {group.products.length} items
                      </div>
                    </div>
                  </div>
                  
                  <div className="group-products">
                    {group.products.map((p, i) => (
                      <div key={i} className="product-item">
                        <div className="product-icon">{icon}</div>
                        <div className="product-name">{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndoorMapComponent;