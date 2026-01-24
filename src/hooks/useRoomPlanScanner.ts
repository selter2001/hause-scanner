import { useState, useCallback } from 'react';
import { ScanProgress, ScanProject, Room, Wall } from '@/types/scan';

// This hook provides the interface for RoomPlan scanning
// The actual AR scanning happens via native iOS code
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
      message: 'Skieruj kamerę na ściany...'
    });

    // In production, this would call the native RoomPlan API via Capacitor plugin
    // For now, we simulate the scanning process for UI development
    if (typeof (window as any).Capacitor !== 'undefined') {
      try {
        // This would be the actual native call:
        // const result = await RoomPlanPlugin.startScan();
        console.log('Native RoomPlan scan would start here');
      } catch (error) {
        console.error('RoomPlan error:', error);
        setScanProgress(prev => ({
          ...prev,
          status: 'error',
          message: 'Błąd skanowania. Spróbuj ponownie.'
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
      walls = Math.floor(progress / 15);
      area = walls * (8 + Math.random() * 4);

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
          message: 'Skanowanie zakończone!'
        });
      } else {
        setScanProgress({
          isScanning: true,
          progress: Math.min(progress, 99),
          detectedWalls: walls,
          currentArea: parseFloat(area.toFixed(1)),
          status: 'scanning',
          message: walls > 0 ? `Wykryto ${walls} ścian...` : 'Szukam ścian...'
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
  const walls: Wall[] = [
    { id: '1', start: { x: 0, y: 0, z: 0 }, end: { x: 5, y: 0, z: 0 }, height: 2.7, length: 5, area: 13.5 },
    { id: '2', start: { x: 5, y: 0, z: 0 }, end: { x: 5, y: 0, z: 4 }, height: 2.7, length: 4, area: 10.8 },
    { id: '3', start: { x: 5, y: 0, z: 4 }, end: { x: 0, y: 0, z: 4 }, height: 2.7, length: 5, area: 13.5 },
    { id: '4', start: { x: 0, y: 0, z: 4 }, end: { x: 0, y: 0, z: 0 }, height: 2.7, length: 4, area: 10.8 }
  ];

  const room: Room = {
    id: 'room-1',
    name: 'Salon',
    walls,
    floor: {
      area: 20,
      vertices: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
        { x: 0, y: 4 }
      ]
    },
    ceiling: {
      height: 2.7
    }
  };

  return {
    id: `project-${Date.now()}`,
    name: 'Nowy skan',
    createdAt: new Date(),
    updatedAt: new Date(),
    rooms: [room],
    totalArea: 20
  };
}
