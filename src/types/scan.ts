export interface WallPoint {
  x: number;
  y: number;
  z: number;
}

export interface Wall {
  id: string;
  start: WallPoint;
  end: WallPoint;
  height: number;
  length: number;
  area: number;
  corners: WallPoint[];
}

export interface RoomPosition {
  x: number;
  y: number;
  rotation: number; // degrees
}

export interface Room {
  id: string;
  name: string;
  walls: Wall[];
  floor: {
    area: number;
    vertices: { x: number; y: number }[];
  };
  ceiling: {
    height: number;
    area: number;
  };
  totalWallArea: number;
  perimeter: number;
  // Position on the building plan
  position: RoomPosition;
  color: string;
}

export interface ScanProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  rooms: Room[];
  totalArea: number;
  totalWallArea: number;
  thumbnail?: string;
}

export interface ScanProgress {
  isScanning: boolean;
  progress: number;
  detectedWalls: number;
  currentArea: number;
  status: 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface RoomMeasurements {
  floorArea: number;
  ceilingArea: number;
  totalWallArea: number;
  perimeter: number;
  height: number;
  walls: {
    id: string;
    length: number;
    height: number;
    area: number;
  }[];
}

// Room colors for visual distinction
export const ROOM_COLORS = [
  'hsl(142, 71%, 45%)',  // Green
  'hsl(210, 100%, 50%)', // Blue
  'hsl(280, 70%, 50%)',  // Purple
  'hsl(30, 90%, 50%)',   // Orange
  'hsl(340, 80%, 50%)',  // Pink
  'hsl(180, 70%, 45%)',  // Cyan
  'hsl(60, 80%, 45%)',   // Yellow
  'hsl(0, 70%, 50%)',    // Red
];