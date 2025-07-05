// utils/dijkstra.js
export default function dijkstra(grid, start, goal) {
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
  const queue = []; // [x, y, distance]
  const dist = Array(grid.length).fill().map(() => Array(grid[0].length).fill(Infinity));
  const prev = Array(grid.length).fill().map(() => Array(grid[0].length).fill(null));
  
  const height = grid.length;
  const width = grid[0].length;
  
  // Initialize starting point
  dist[start[1]][start[0]] = 0;
  queue.push([start[0], start[1], 0]);
  
  while (queue.length > 0) {
    // Sort queue by distance (min-heap simulation)
    queue.sort((a, b) => a[2] - b[2]);
    const [x, y, d] = queue.shift();
    
    // Check if we've reached the goal
    if (x === goal[0] && y === goal[1]) {
      // Reconstruct path
      const path = [];
      let current = [x, y];
      while (current) {
        path.unshift(current);
        const [cx, cy] = current;
        current = prev[cy][cx];
      }
      return path;
    }
    
    // Explore neighbors
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      
      // Check boundaries and walkability
      if (
        nx < 0 || nx >= width || 
        ny < 0 || ny >= height || 
        grid[ny][nx] !== 0 // 0 = walkable
      ) {
        continue;
      }
      
      const newDist = d + 1;
      if (newDist < dist[ny][nx]) {
        dist[ny][nx] = newDist;
        prev[ny][nx] = [x, y];
        queue.push([nx, ny, newDist]);
      }
    }
  }
  
  return []; // No path found
}