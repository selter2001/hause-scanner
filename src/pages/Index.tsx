import { useState, useCallback } from 'react';
import { ScanProject, Room } from '@/types/scan';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ScannerView } from '@/components/scanner/ScannerView';
import { ScanResult } from '@/components/scanner/ScanResult';
import { useRoomPlanScanner } from '@/hooks/useRoomPlanScanner';
import { ArrowLeft } from 'lucide-react';

type AppView = 'list' | 'scanner' | 'result' | 'detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [projects, setProjects] = useState<ScanProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ScanProject | null>(null);
  
  const { scanProgress, currentProject, startScan, stopScan, resetScan } = useRoomPlanScanner();

  const handleNewScan = useCallback(() => {
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
    if (currentProject) {
      setCurrentView('result');
    }
  }, [currentProject]);

  const handleConfirmRoom = useCallback((roomName: string) => {
    if (currentProject) {
      const updatedProject: ScanProject = {
        ...currentProject,
        name: roomName,
        rooms: currentProject.rooms.map((room, index) => 
          index === 0 ? { ...room, name: roomName } : room
        )
      };
      setProjects(prev => [updatedProject, ...prev]);
      setSelectedProject(updatedProject);
      setCurrentView('detail');
      resetScan();
    }
  }, [currentProject, resetScan]);

  const handleCancelResult = useCallback(() => {
    resetScan();
    setCurrentView('list');
  }, [resetScan]);

  // Check if scan just completed
  if (scanProgress.status === 'complete' && currentProject && currentView === 'scanner') {
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
              onClick={handleBackToList}
              className="absolute top-4 left-4 p-3 glass-card rounded-xl safe-area-inset active:scale-95 transition-transform"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
          )}
        </div>
      )}

      {currentView === 'result' && currentProject && (
        <ScanResult
          room={currentProject.rooms[0]}
          onConfirm={handleConfirmRoom}
          onCancel={handleCancelResult}
        />
      )}

      {currentView === 'detail' && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={handleBackToList}
          onDelete={handleDeleteProject}
        />
      )}
    </div>
  );
};

export default Index;