// src/components/EnhancedStoreMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Graphics, Text, Container } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import dijkstra from '@/Utliss/dijkstra';

const PixiViewport = ({ width, height, children }) => {
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const [viewportReady, setViewportReady] = useState(false);
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (stageRef.current && !viewportRef.current) {
      const app = stageRef.current;
      const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldWidth: 2000,
        worldHeight: 2000,
        interaction: app.renderer.plugins.interaction,
      });

      viewport.drag().pinch().wheel().decelerate();
      app.stage.addChild(viewport);
      viewportRef.current = viewport;
      setViewportReady(true);
      setContainer(viewport);
    }
  }, [width, height]);

  return (
    <Stage
      width={width}
      height={height}
      options={{ backgroundColor: 0xf8f9fa, antialias: true, resolution: window.devicePixelRatio || 1 }}
      onMount={(app) => {
        stageRef.current = app;
      }}
    >
      {viewportReady && container && (
        <Container>
          {React.Children.map(children, (child) => React.cloneElement(child))}
        </Container>
      )}
    </Stage>
  );
};

export default PixiViewport;