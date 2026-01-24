import { useState, useCallback } from 'react';
import { ScanProject } from '@/types/scan';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ScannerView } from '@/components/scanner/ScannerView';
import { useRoomPlanScanner } from '@/hooks/useRoomPlanScanner';

type AppView = 'list' | 'scanner' | 'detail';

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
      setProjects(prev => [currentProject, ...prev]);
      setSelectedProject(currentProject);
      setCurrentView('detail');
      resetScan();
    }
  }, [currentProject, resetScan]);

  // Check if scan just completed
  if (scanProgress.status === 'complete' && currentProject && currentView === 'scanner') {
    // Auto-navigate after short delay to show completion message
    setTimeout(handleScanComplete, 1000);
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
              <svg className="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
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
