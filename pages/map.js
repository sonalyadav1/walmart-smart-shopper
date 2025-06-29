import { useState, useRef, useEffect } from "react";

export default function StoreMapPage() {
  const [showMap, setShowMap] = useState(false);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Ensure body and html take full height
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";
    return () => {
      document.body.style.margin = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";
    };
  }, []);

  // Mouse event handlers for drag-to-scroll
  const onMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
    containerRef.current.style.cursor = "grabbing";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    containerRef.current.scrollLeft = start.current.scrollLeft - dx;
    containerRef.current.scrollTop = start.current.scrollTop - dy;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    containerRef.current.style.cursor = "grab";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div style={{ minHeight: "100vh", margin: 0, padding: 0 }}>
      <button
        className="walmart-btn-primary"
        onClick={() => setShowMap(true)}
        style={{ position: "absolute", zIndex: 10, top: 16, left: 16 }}
      >
        View Store Map
      </button>

      {showMap && (
        <div
          ref={containerRef}
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            borderRadius: 0,
            border: "none",
            cursor: "grab",
            background: "#fff",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9,
          }}
          onMouseDown={onMouseDown}
        >
          <img
            src="/map.jpg"
            alt="Store Map"
            style={{
              width: "3200px",
              height: "2400px",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}