import { useState, useCallback } from 'react';
import { ScanProgress, ScanProject, Room, Wall, ROOM_COLORS } from '@/types/scan';

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

  const startScan = useCallback(async () => {
    setScanProgress({
      isScanning: true,
      progress: 0,
      detectedWalls: 0,
      currentArea: 0,
      status: 'scanning',
      message: 'Point camera at walls...'
    });

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
    perimeter: parseFloat(perimeter.toFixed(2)),
    position: { x: index * 6, y: 0, rotation: 0 },
    color: ROOM_COLORS[index % ROOM_COLORS.length]
  };
}