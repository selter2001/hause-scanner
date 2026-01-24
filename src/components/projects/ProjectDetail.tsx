import { ScanProject, Room, ROOM_COLORS } from '@/types/scan';
import { ArrowLeft, Map, Box, Building2, Share, Trash2, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { FloorPlanView } from '../viewer/FloorPlanView';
import { Room3DView } from '../viewer/Room3DView';
import { BuildingPlanView } from '../viewer/BuildingPlanView';

interface ProjectDetailProps {
  project: ScanProject;
  onBack: () => void;
  onDelete: (id: string) => void;
  onAddRoom: () => void;
  onUpdateRoomPosition: (roomId: string, position: { x: number; y: number; rotation: number }) => void;
}

type ViewMode = 'building' | 'room2d' | 'room3d';

export function ProjectDetail({ project, onBack, onDelete, onAddRoom, onUpdateRoomPosition }: ProjectDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('building');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    project.rooms.length > 0 ? project.rooms[0].id : null
  );

  const selectedRoom = project.rooms.find(r => r.id === selectedRoomId);

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
            onClick={() => setViewMode('building')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'building'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Plan</span>
          </button>
          <button
            onClick={() => setViewMode('room2d')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'room2d'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">2D</span>
          </button>
          <button
            onClick={() => setViewMode('room3d')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'room3d'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">3D</span>
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
        {viewMode === 'building' && (
          <BuildingPlanView 
            project={project} 
            onUpdateRoomPosition={onUpdateRoomPosition}
            onAddRoom={onAddRoom}
          />
        )}
        {viewMode === 'room2d' && selectedRoom && (
          <div className="h-full flex flex-col">
            {/* Room selector */}
            {project.rooms.length > 1 && (
              <div className="p-3 border-b border-border flex gap-2 overflow-x-auto">
                {project.rooms.map((room, index) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedRoomId === room.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: ROOM_COLORS[index % ROOM_COLORS.length] }}
                    />
                    {room.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1">
              <FloorPlanView project={{ ...project, rooms: [selectedRoom] }} />
            </div>
          </div>
        )}
        {viewMode === 'room3d' && selectedRoom && (
          <div className="h-full flex flex-col">
            {/* Room selector */}
            {project.rooms.length > 1 && (
              <div className="p-3 border-b border-border flex gap-2 overflow-x-auto">
                {project.rooms.map((room, index) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedRoomId === room.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: ROOM_COLORS[index % ROOM_COLORS.length] }}
                    />
                    {room.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1">
              <Room3DView project={{ ...project, rooms: [selectedRoom] }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 border-t border-border safe-area-inset">
        <div className="flex items-center gap-3">
          <button 
            onClick={onAddRoom}
            className="flex-1 py-3 px-4 rounded-xl bg-accent/10 text-accent border border-accent/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Room</span>
          </button>
          <button className="flex-1 py-3 px-4 rounded-xl premium-button flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Export</span>
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