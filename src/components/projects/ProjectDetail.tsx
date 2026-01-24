import { ScanProject } from '@/types/scan';
import { ArrowLeft, Map, Box, Share, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';
import { FloorPlanView } from '../viewer/FloorPlanView';
import { Room3DView } from '../viewer/Room3DView';

interface ProjectDetailProps {
  project: ScanProject;
  onBack: () => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'floor' | '3d';

export function ProjectDetail({ project, onBack, onDelete }: ProjectDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('floor');

  const room = project.rooms[0];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border safe-area-inset">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
          <button
            onClick={() => setViewMode('floor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'floor'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Map className="h-4 w-4 inline mr-2" />
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Box className="h-4 w-4 inline mr-2" />
            3D
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all">
            <Share className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'floor' ? (
          <FloorPlanView project={project} />
        ) : (
          <Room3DView project={project} />
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 border-t border-border safe-area-inset">
        <div className="flex items-center gap-3">
          <button className="flex-1 py-3 px-4 rounded-xl premium-button flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Export Report</span>
          </button>
          <button 
            onClick={() => onDelete(project.id)}
            className="py-3 px-4 rounded-xl bg-destructive/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
}