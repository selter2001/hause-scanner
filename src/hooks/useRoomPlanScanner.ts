import { useState, useCallback } from 'react';
import { ScanProgress, ScanProject, Room, Wall } from '@/types/scan';

export function useRoomPlanScanner() {
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    progress: 0,
    detectedWalls: 0,
    currentArea: 0,
    status: 'idle'
  });

  const [currentProject, setCurrentProject] = useState<ScanProject | null>(null);

  const startScan = useCallback(async () => {
    setScanProgress({
      isScanning: true,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'scanning',
      message: 'Point camera at walls...'
    });

    // In production, this would call the native RoomPlan API via Capacitor plugin
    if (typeof (window as any).Capacitor !== 'undefined') {
      try {
        console.log('Native RoomPlan scan would start here');
      } catch (error) {
        console.error('RoomPlan error:', error);
        setScanProgress(prev => ({
          ...prev,
          status: 'error',
          message: 'Scan failed. Please try again.'
        }));
      }
    } else {
      // Simulation for web preview
      simulateScan();
    }
  }, []);

  const simulateScan = useCallback(() => {
    let progress = 0;
    let walls = 0;
    let area = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2;
      walls = Math.floor(progress / 20);
      area = walls * (6 + Math.random() * 4);

      if (progress >= 100) {
        clearInterval(interval);
        
        const mockProject = generateMockProject();
        setCurrentProject(mockProject);
        
        setScanProgress({
          isScanning: false,
          progress: 100,
          detectedWalls: mockProject.rooms[0].walls.length,
          currentArea: mockProject.totalArea,
          status: 'complete',
          message: 'Scan complete!'
        });
      } else {
        setScanProgress({
          isScanning: true,
          progress: Math.min(progress, 99),
          detectedWalls: walls,
          currentArea: parseFloat(area.toFixed(1)),
          status: 'scanning',
          message: walls > 0 ? `Detected ${walls} walls...` : 'Searching for walls...'
        });
      }
    }, 200);
  }, []);

  const stopScan = useCallback(() => {
    setScanProgress({
      isScanning: false,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'idle'
    });
  }, []);

  const resetScan = useCallback(() => {
    setCurrentProject(null);
    setScanProgress({
      isScanning: false,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'idle'
    });
  }, []);

  return {
    scanProgress,
    currentProject,
    startScan,
    stopScan,
    resetScan
  };
}

function generateMockProject(): ScanProject {
  // Generate a realistic room shape (L-shaped room for variety)
  const roomWidth = 4.2 + Math.random() * 1.5;
  const roomDepth = 3.8 + Math.random() * 1.2;
  const height = 2.65 + Math.random() * 0.2;

  const vertices = [
    { x: 0, y: 0 },
    { x: roomWidth, y: 0 },
    { x: roomWidth, y: roomDepth },
    { x: 0, y: roomDepth }
  ];

  const walls: Wall[] = vertices.map((vertex, i) => {
    const nextVertex = vertices[(i + 1) % vertices.length];
    const length = Math.sqrt(
      Math.pow(nextVertex.x - vertex.x, 2) + Math.pow(nextVertex.y - vertex.y, 2)
    );
    const wallArea = length * height;

    return {
      id: `wall-${i + 1}`,
      start: { x: vertex.x, y: 0, z: vertex.y },
      end: { x: nextVertex.x, y: 0, z: nextVertex.y },
      height: parseFloat(height.toFixed(2)),
      length: parseFloat(length.toFixed(2)),
      area: parseFloat(wallArea.toFixed(2)),
      corners: [
        { x: vertex.x, y: 0, z: vertex.y },
        { x: nextVertex.x, y: 0, z: nextVertex.y },
        { x: nextVertex.x, y: height, z: nextVertex.y },
        { x: vertex.x, y: height, z: vertex.y }
      ]
    };
  });

  const floorArea = roomWidth * roomDepth;
  const perimeter = walls.reduce((sum, w) => sum + w.length, 0);
  const totalWallArea = walls.reduce((sum, w) => sum + w.area, 0);

  const room: Room = {
    id: 'room-1',
    name: 'New Room',
    walls,
    floor: {
      area: parseFloat(floorArea.toFixed(2)),
      vertices
    },
    ceiling: {
      height: parseFloat(height.toFixed(2)),
      area: parseFloat(floorArea.toFixed(2))
    },
    totalWallArea: parseFloat(totalWallArea.toFixed(2)),
    perimeter: parseFloat(perimeter.toFixed(2))
  };

  return {
    id: `project-${Date.now()}`,
    name: 'New Scan',
    createdAt: new Date(),
    updatedAt: new Date(),
    rooms: [room],
    totalArea: parseFloat(floorArea.toFixed(2)),
    totalWallArea: parseFloat(totalWallArea.toFixed(2))
  };
}