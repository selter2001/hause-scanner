import { ScanProject } from '@/types/scan';
import { Plus, ChevronRight, Home, Calendar, Square } from 'lucide-react';
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
      <div className="p-6 pt-8 safe-area-inset">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl scanner-gradient">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skaner Domu</h1>
            <p className="text-sm text-muted-foreground">Twoje projekty skanów</p>
          </div>
        </div>
      </div>

      {/* New scan button */}
      <div className="px-4 mb-6">
        <button
          onClick={onNewScan}
          className="w-full p-4 rounded-2xl scanner-gradient flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.4)' }}
        >
          <Plus className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white">Nowy skan</span>
        </button>
      </div>

      {/* Projects list */}
      <div className="flex-1 px-4 pb-8 overflow-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">Brak projektów</p>
            <p className="text-sm text-muted-foreground">
              Rozpocznij skanowanie, aby utworzyć pierwszy projekt
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground px-1 mb-3">
              Ostatnie projekty ({projects.length})
            </p>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="w-full glass-card p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <Home className="h-7 w-7 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Square className="h-3 w-3" />
                      <span>{project.totalArea} m²</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(project.createdAt, { 
                          addSuffix: true, 
                          locale: pl 
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {project.rooms.length} {project.rooms.length === 1 ? 'pomieszczenie' : 'pomieszczeń'}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
