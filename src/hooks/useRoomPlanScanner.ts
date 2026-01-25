import { useState, useCallback, useEffect, useRef } from 'react';
import { ScanProgress, ScanProject, Room, Wall, ROOM_COLORS } from '@/types/scan';
import { Capacitor } from '@capacitor/core';
import RoomPlanPlugin, { RoomPlanResult } from '@/plugins/RoomPlanPlugin';

export function useRoomPlanScanner() {
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    isScanning: false,
    progress: 0,
    detectedWalls: 0,
    currentArea: 0,
    status: 'idle'
  });

  const [currentProject, setCurrentProject] = useState<ScanProject | null>(null);
  const [scannedRoom, setScannedRoom] = useState<Room | null>(null);
  const [isNativeAvailable, setIsNativeAvailable] = useState(false);

  // Check if native RoomPlan is available on startup
  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await RoomPlanPlugin.isSupported();
          setIsNativeAvailable(result.supported);
          console.log('RoomPlan support:', result);
        } catch (error) {
          console.log('RoomPlan not available:', error);
          setIsNativeAvailable(false);
        }
      }
    };
    checkSupport();
  }, []);

  // Listen for scan complete events from native
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupListener = async () => {
      try {
        const listener = await RoomPlanPlugin.addListener('scanComplete', async (event) => {
          console.log('Scan complete event:', event);
          
          // Get full results from native
          try {
            const results = await RoomPlanPlugin.getResults();
            const room = convertNativeResultToRoom(results);
            setScannedRoom(room);
            
            setScanProgress({
              isScanning: false,
              progress: 100,
              detectedWalls: results.measurements.wallCount,
              currentArea: results.measurements.totalFloorArea,
              status: 'complete',
              message: 'Scan complete!'
            });
          } catch (error) {
            console.error('Error getting results:', error);
          }
        });

        return () => {
          listener.remove();
        };
      } catch (error) {
        console.log('Could not set up listener:', error);
      }
    };

    setupListener();
  }, []);

  const startScan = useCallback(async () => {
    setScanProgress({
      isScanning: true,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'scanning',
      message: 'Skieruj kamerę na ściany...'
    });

    if (Capacitor.isNativePlatform() && isNativeAvailable) {
      try {
        console.log('Starting native RoomPlan scan...');
        await RoomPlanPlugin.startScan();
        // Native scan started - the UI overlay is handled by native code
        // Progress will be simulated, completion comes from native event
      } catch (error) {
        console.error('RoomPlan error:', error);
        setScanProgress(prev => ({
          ...prev,
          status: 'error',
          message: 'Skanowanie nie powiodło się. Spróbuj ponownie.'
        }));
      }
    } else {
      // Web fallback - simulate scan
      console.log('Using simulated scan (web mode)');
      simulateScan();
    }
  }, [isNativeAvailable]);

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
        
        const mockRoom = generateMockRoom(0);
        setScannedRoom(mockRoom);
        
        setScanProgress({
          isScanning: false,
          progress: 100,
          detectedWalls: mockRoom.walls.length,
          currentArea: mockRoom.floor.area,
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

  const stopScan = useCallback(async () => {
    if (Capacitor.isNativePlatform() && isNativeAvailable) {
      try {
        await RoomPlanPlugin.stopScan();
      } catch (error) {
        console.error('Error stopping scan:', error);
      }
    }
    setScanProgress({
      isScanning: false,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'idle'
    });
  }, [isNativeAvailable]);

  const resetScan = useCallback(() => {
    setScannedRoom(null);
    setScanProgress({
      isScanning: false,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'idle'
    });
  }, []);

  const addRoomToProject = useCallback((room: Room, projectId?: string) => {
    setCurrentProject(prev => {
      if (prev && prev.id === projectId) {
        // Add room to existing project
        const updatedRooms = [...prev.rooms, room];
        const totalArea = updatedRooms.reduce((sum, r) => sum + r.floor.area, 0);
        const totalWallArea = updatedRooms.reduce((sum, r) => sum + r.totalWallArea, 0);
        
        return {
          ...prev,
          rooms: updatedRooms,
          totalArea: parseFloat(totalArea.toFixed(2)),
          totalWallArea: parseFloat(totalWallArea.toFixed(2)),
          updatedAt: new Date()
        };
      } else {
        // Create new project with this room
        return {
          id: `project-${Date.now()}`,
          name: 'New Project',
          createdAt: new Date(),
          updatedAt: new Date(),
          rooms: [room],
          totalArea: room.floor.area,
          totalWallArea: room.totalWallArea
        };
      }
    });
  }, []);

  const updateRoomPosition = useCallback((roomId: string, position: { x: number; y: number; rotation: number }) => {
    setCurrentProject(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        rooms: prev.rooms.map(room => 
          room.id === roomId 
            ? { ...room, position }
            : room
        ),
        updatedAt: new Date()
      };
    });
  }, []);

  return {
    scanProgress,
    currentProject,
    scannedRoom,
    setCurrentProject,
    startScan,
    stopScan,
    resetScan,
    addRoomToProject,
    updateRoomPosition
  };
}

// Convert native RoomPlan results to our Room type
function convertNativeResultToRoom(results: RoomPlanResult): Room {
  const walls: Wall[] = results.walls.map((wall, i) => ({
    id: wall.id,
    start: { x: wall.corners[0]?.x || 0, y: 0, z: wall.corners[0]?.z || 0 },
    end: { x: wall.corners[1]?.x || 0, y: 0, z: wall.corners[1]?.z || 0 },
    height: wall.height,
    length: wall.length,
    area: wall.area,
    corners: wall.corners.map(c => ({ x: c.x, y: c.y, z: c.z }))
  }));

  const floor = results.floors[0];
  const vertices = floor?.vertices || [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 }
  ];

  return {
    id: `room-${Date.now()}`,
    name: 'Nowy pokój',
    walls,
    floor: {
      area: results.measurements.totalFloorArea,
      vertices
    },
    ceiling: {
      height: results.measurements.height,
      area: results.measurements.ceilingArea
    },
    totalWallArea: results.measurements.totalWallArea,
    perimeter: results.measurements.perimeter,
    position: { x: 0, y: 0, rotation: 0 },
    color: ROOM_COLORS[0]
  };
}

function generateMockRoom(index: number): Room {
  const roomWidth = 3.5 + Math.random() * 2.5;
  const roomDepth = 3.0 + Math.random() * 2.0;
  const height = 2.60 + Math.random() * 0.3;

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

  return {
    id: `room-${Date.now()}-${index}`,
    name: 'Nowy pokój',
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
    perimeter: parseFloat(perimeter.toFixed(2)),
    position: { x: index * 6, y: 0, rotation: 0 },
    color: ROOM_COLORS[index % ROOM_COLORS.length]
  };
}