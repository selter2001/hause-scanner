import { useState, useCallback } from 'react';
import { ScanProject, Room, ROOM_COLORS } from '@/types/scan';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ScannerView } from '@/components/scanner/ScannerView';
import { ScanResult } from '@/components/scanner/ScanResult';
import { useRoomPlanScanner } from '@/hooks/useRoomPlanScanner';
import { ArrowLeft } from 'lucide-react';
import { roundTo } from '@/lib/geometry';

type AppView = 'list' | 'scanner' | 'result' | 'detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [projects, setProjects] = useState<ScanProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ScanProject | null>(null);
  
  const { 
    scanProgress, 
    scannedRoom, 
    startScan, 
    stopScan, 
    resetScan 
  } = useRoomPlanScanner();

  const handleNewScan = useCallback(() => {
    resetScan();
    setCurrentView('scanner');
  }, [resetScan]);

  const handleNewScanForProject = useCallback(() => {
    // Keep selected project but start new scan
    resetScan();
    setCurrentView('scanner');
  }, [resetScan]);

  const handleSelectProject = useCallback((project: ScanProject) => {
    setSelectedProject(project);
    setCurrentView('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedProject(null);
    setCurrentView('list');
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    handleBackToList();
  }, [handleBackToList]);

  const handleScanComplete = useCallback(() => {
    if (scannedRoom) {
      setCurrentView('result');
    }
  }, [scannedRoom]);

  const handleConfirmRoom = useCallback((roomName: string) => {
    if (!scannedRoom) return;

    const roomIndex = selectedProject ? selectedProject.rooms.length : 0;
    
    const newRoom: Room = {
      ...scannedRoom,
      name: roomName,
      color: ROOM_COLORS[roomIndex % ROOM_COLORS.length],
      position: { 
        x: roomIndex * 6, 
        y: 0, 
        rotation: 0 
      }
    };

    if (selectedProject) {
      // Add room to existing project
      const updatedProject: ScanProject = {
        ...selectedProject,
        rooms: [...selectedProject.rooms, newRoom],
        totalArea: parseFloat((selectedProject.totalArea + newRoom.floor.area).toFixed(2)),
        totalWallArea: parseFloat((selectedProject.totalWallArea + newRoom.totalWallArea).toFixed(2)),
        updatedAt: new Date()
      };
      
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setSelectedProject(updatedProject);
    } else {
      // Create new project
      const newProject: ScanProject = {
        id: `project-${Date.now()}`,
        name: roomName,
        createdAt: new Date(),
        updatedAt: new Date(),
        rooms: [newRoom],
        totalArea: newRoom.floor.area,
        totalWallArea: newRoom.totalWallArea
      };
      
      setProjects(prev => [newProject, ...prev]);
      setSelectedProject(newProject);
    }
    
    setCurrentView('detail');
    resetScan();
  }, [scannedRoom, selectedProject, resetScan]);

  const handleCancelResult = useCallback(() => {
    resetScan();
    if (selectedProject) {
      setCurrentView('detail');
    } else {
      setCurrentView('list');
    }
  }, [resetScan, selectedProject]);

  const handleUpdateRoomPosition = useCallback((roomId: string, position: { x: number; y: number; rotation: number }) => {
    if (!selectedProject) return;

    const updatedProject: ScanProject = {
      ...selectedProject,
      rooms: selectedProject.rooms.map(room => 
        room.id === roomId ? { ...room, position } : room
      ),
      updatedAt: new Date()
    };

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  }, [selectedProject]);

  const handleUpdateRoom = useCallback((updatedRoom: Room) => {
    if (!selectedProject) return;

    const updatedRooms = selectedProject.rooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    );

    const totalArea = roundTo(updatedRooms.reduce((sum, r) => sum + r.floor.area, 0));
    const totalWallArea = roundTo(updatedRooms.reduce((sum, r) => sum + r.totalWallArea, 0));

    const updatedProject: ScanProject = {
      ...selectedProject,
      rooms: updatedRooms,
      totalArea,
      totalWallArea,
      updatedAt: new Date()
    };

    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  }, [selectedProject]);

  // Check if scan just completed
  if (scanProgress.status === 'complete' && scannedRoom && currentView === 'scanner') {
    setTimeout(handleScanComplete, 500);
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {currentView === 'list' && (
        <ProjectList
          projects={projects}
          onSelectProject={handleSelectProject}
          onNewScan={handleNewScan}
        />
      )}

      {currentView === 'scanner' && (
        <div className="relative h-full">
          <ScannerView
            progress={scanProgress}
            onStartScan={startScan}
            onStopScan={stopScan}
          />
          {/* Back button */}
          {!scanProgress.isScanning && scanProgress.status !== 'complete' && (
            <button
              onClick={() => selectedProject ? setCurrentView('detail') : handleBackToList()}
              className="absolute top-4 left-4 p-3 glass-card rounded-xl safe-area-inset active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
          )}
        </div>
      )}

      {currentView === 'result' && scannedRoom && (
        <ScanResult
          room={scannedRoom}
          roomIndex={selectedProject ? selectedProject.rooms.length : 0}
          onConfirm={handleConfirmRoom}
          onCancel={handleCancelResult}
        />
      )}

      {currentView === 'detail' && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToList}
          onDelete={handleDeleteProject}
          onAddRoom={handleNewScanForProject}
          onUpdateRoomPosition={handleUpdateRoomPosition}
          onUpdateRoom={handleUpdateRoom}
        />
      )}
    </div>
  );
};

export default Index;
