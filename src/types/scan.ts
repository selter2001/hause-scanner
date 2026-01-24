export interface Wall {
  id: string;
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  height: number;
  length: number;
  area: number;
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
  };
}

export interface ScanProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  rooms: Room[];
  totalArea: number;
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
