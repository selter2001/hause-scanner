// Geometry utilities for room measurements

export interface Vertex {
  x: number;
  y: number;
}

/**
 * Calculate the length between two vertices
 */
export function calculateDistance(v1: Vertex, v2: Vertex): number {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate polygon area using Shoelace formula
 */
export function calculatePolygonArea(vertices: Vertex[]): number {
  if (vertices.length < 3) return 0;
  
  let area = 0;
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  
  return Math.abs(area / 2);
}

/**
 * Calculate perimeter of a polygon
 */
export function calculatePerimeter(vertices: Vertex[]): number {
  if (vertices.length < 2) return 0;
  
  let perimeter = 0;
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perimeter += calculateDistance(vertices[i], vertices[j]);
  }
  
  return perimeter;
}

/**
 * Recalculate all wall lengths based on current vertices
 */
export function recalculateWallLengths(vertices: Vertex[]): number[] {
  const lengths: number[] = [];
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    lengths.push(parseFloat(calculateDistance(vertices[i], vertices[j]).toFixed(2)));
  }
  
  return lengths;
}

/**
 * Round a number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}
