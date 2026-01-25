import { WebPlugin } from '@capacitor/core';
import type { RoomPlanPluginInterface, RoomPlanResult, ScanCompleteEvent } from './RoomPlanPlugin';

// Web fallback - simulates scanning for browser preview
export class RoomPlanPluginWeb extends WebPlugin implements RoomPlanPluginInterface {
  async isSupported(): Promise<{ supported: boolean; version: string; error?: string }> {
    return {
      supported: false,
      version: '1.0',
      error: 'RoomPlan is only available on iOS devices with LiDAR'
    };
  }

  async startScan(): Promise<{ status: string; timestamp: string }> {
    console.log('Web: Simulating scan start');
    return {
      status: 'scanning',
      timestamp: new Date().toISOString()
    };
  }

  async stopScan(): Promise<{ status: string; timestamp: string }> {
    console.log('Web: Simulating scan stop');
    return {
      status: 'stopped',
      timestamp: new Date().toISOString()
    };
  }

  async getResults(): Promise<RoomPlanResult> {
    // Return mock data for web preview
    const width = 4.2;
    const depth = 3.8;
    const height = 2.65;
    
    return {
      walls: [
        { id: 'wall-1', length: width, height, area: width * height, position: { x: 0, y: 0, z: -depth/2 }, corners: [] },
        { id: 'wall-2', length: depth, height, area: depth * height, position: { x: width/2, y: 0, z: 0 }, corners: [] },
        { id: 'wall-3', length: width, height, area: width * height, position: { x: 0, y: 0, z: depth/2 }, corners: [] },
        { id: 'wall-4', length: depth, height, area: depth * height, position: { x: -width/2, y: 0, z: 0 }, corners: [] },
      ],
      floors: [
        { id: 'floor-1', width, depth, area: width * depth, position: { x: 0, y: 0, z: 0 }, vertices: [] }
      ],
      measurements: {
        wallCount: 4,
        totalWallArea: 2 * (width + depth) * height,
        totalFloorArea: width * depth,
        ceilingArea: width * depth,
        perimeter: 2 * (width + depth),
        height
      },
      metadata: {
        scanDuration: 12.5,
        timestamp: new Date().toISOString()
      }
    };
  }
}
