import { registerPlugin } from '@capacitor/core';

export interface RoomPlanResult {
  walls: Array<{
    id: string;
    length: number;
    height: number;
    area: number;
    position: { x: number; y: number; z: number };
    corners: Array<{ x: number; y: number; z: number }>;
  }>;
  floors: Array<{
    id: string;
    width: number;
    depth: number;
    area: number;
    position: { x: number; y: number; z: number };
    vertices: Array<{ x: number; y: number }>;
  }>;
  measurements: {
    wallCount: number;
    totalWallArea: number;
    totalFloorArea: number;
    ceilingArea: number;
    perimeter: number;
    height: number;
  };
  metadata: {
    scanDuration: number;
    timestamp: string;
  };
}

export interface ScanCompleteEvent {
  wallCount: number;
  floorArea: number;
  status: string;
}

export interface RoomPlanPluginInterface {
  isSupported(): Promise<{ supported: boolean; version: string; error?: string }>;
  startScan(): Promise<{ status: string; timestamp: string }>;
  stopScan(): Promise<{ status: string; timestamp: string }>;
  getResults(): Promise<RoomPlanResult>;
  addListener(
    eventName: 'scanComplete',
    listenerFunc: (event: ScanCompleteEvent) => void
  ): Promise<{ remove: () => void }>;
}

// This registers the plugin - it will connect to the native Swift code
const RoomPlanPlugin = registerPlugin<RoomPlanPluginInterface>('RoomPlanPlugin', {
  web: () => import('./RoomPlanPluginWeb').then(m => new m.RoomPlanPluginWeb()),
});

export default RoomPlanPlugin;
