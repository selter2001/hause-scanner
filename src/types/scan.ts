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
  // Corner points for manual adjustment
  corners: WallPoint[];
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
  // Calculated totals
  totalWallArea: number;
  perimeter: number;
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