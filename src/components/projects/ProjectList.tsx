import { ScanProject } from '@/types/scan';
import { Plus, Home, ChevronRight, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ProjectListProps {
  projects: ScanProject[];
  onSelectProject: (project: ScanProject) => void;
  onNewScan: () => void;
}

export function ProjectList({ projects, onSelectProject, onNewScan }: ProjectListProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 safe-area-inset">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">House Scanner</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Professional room measurement
        </p>
      </div>

      {/* New Scan Button */}
      <div className="px-6 pb-6">
        <button
          onClick={onNewScan}
          className="w-full py-4 px-6 rounded-2xl premium-button flex items-center justify-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-primary-foreground">New Scan</p>
            <p className="text-xs text-primary-foreground/70">Start measuring a room</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary-foreground/50" />
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-auto px-6">
        {projects.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Recent Projects
            </p>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="w-full p-4 rounded-xl premium-card text-left flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Home className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{project.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="measurement-badge">
                      {project.totalArea.toFixed(1)} m²
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {project.rooms.length} {project.rooms.length === 1 ? 'room' : 'rooms'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(project.createdAt, { addSuffix: true, locale: pl })}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm max-w-[240px]">
              Start by scanning your first room to create professional floor plans
            </p>
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div className="px-6 py-4 text-center safe-area-inset">
        <p className="text-xs text-muted-foreground/50">
          House Scanner Pro • v1.0
        </p>
      </div>
    </div>
  );
}