import { useState, useRef, useCallback } from 'react';
import { ScanProject, Room } from '@/types/scan';
import { ZoomIn, ZoomOut, RotateCcw, Move, RotateCw, Lock, Unlock, Plus } from 'lucide-react';

interface BuildingPlanViewProps {
  project: ScanProject;
  onUpdateRoomPosition: (roomId: string, position: { x: number; y: number; rotation: number }) => void;
  onAddRoom: () => void;
}

export function BuildingPlanView({ project, onUpdateRoomPosition, onAddRoom }: BuildingPlanViewProps) {
  const [scale, setScale] = useState(0.8);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; roomX: number; roomY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate bounds for all rooms
  const allVertices = project.rooms.flatMap(room => 
    room.floor.vertices.map(v => ({
      x: v.x + room.position.x,
      y: v.y + room.position.y
    }))
  );

  const minX = allVertices.length > 0 ? Math.min(...allVertices.map(v => v.x)) - 2 : -5;
  const maxX = allVertices.length > 0 ? Math.max(...allVertices.map(v => v.x)) + 2 : 10;
  const minY = allVertices.length > 0 ? Math.min(...allVertices.map(v => v.y)) - 2 : -5;
  const maxY = allVertices.length > 0 ? Math.max(...allVertices.map(v => v.y)) + 2 : 10;

  const width = maxX - minX;
  const height = maxY - minY;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.3));
  const handleReset = () => {
    setScale(0.8);
    setViewOffset({ x: 0, y: 0 });
    setSelectedRoom(null);
  };

  const handleRoomClick = (roomId: string) => {
    if (!isLocked) {
      setSelectedRoom(roomId === selectedRoom ? null : roomId);
    }
  };

  const handleRotateRoom = (direction: 1 | -1) => {
    if (selectedRoom) {
      const room = project.rooms.find(r => r.id === selectedRoom);
      if (room) {
        const newRotation = (room.position.rotation + direction * 90) % 360;
        onUpdateRoomPosition(selectedRoom, { ...room.position, rotation: newRotation });
      }
    }
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, roomId: string) => {
    if (isLocked) return;
    
    const room = project.rooms.find(r => r.id === roomId);
    if (!room) return;

    setSelectedRoom(roomId);
    setIsDragging(true);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        roomX: room.position.x,
        roomY: room.position.y
      };
    }
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isLocked, project.rooms]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !selectedRoom || !dragStartRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;
    
    // Convert pixel movement to SVG units
    const pixelToUnit = width / (svgWidth * scale);
    
    const dx = (e.clientX - dragStartRef.current.x) * pixelToUnit;
    const dy = (e.clientY - dragStartRef.current.y) * pixelToUnit;

    const newX = parseFloat((dragStartRef.current.roomX + dx).toFixed(2));
    const newY = parseFloat((dragStartRef.current.roomY + dy).toFixed(2));

    const room = project.rooms.find(r => r.id === selectedRoom);
    if (room) {
      onUpdateRoomPosition(selectedRoom, { ...room.position, x: newX, y: newY });
    }
  }, [isDragging, selectedRoom, width, scale, project.rooms, onUpdateRoomPosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const getTransformedVertices = (room: Room) => {
    const rad = (room.position.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // Get center of room
    const cx = room.floor.vertices.reduce((sum, v) => sum + v.x, 0) / room.floor.vertices.length;
    const cy = room.floor.vertices.reduce((sum, v) => sum + v.y, 0) / room.floor.vertices.length;

    return room.floor.vertices.map(v => {
      // Translate to origin, rotate, translate back, then apply position
      const rx = (v.x - cx) * cos - (v.y - cy) * sin + cx;
      const ry = (v.x - cx) * sin + (v.y - cy) * cos + cy;
      return {
        x: rx + room.position.x,
        y: ry + room.position.y
      };
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Building Plan</h2>
          <p className="text-sm text-muted-foreground">
            {project.rooms.length} rooms • {project.totalArea} m² total
          </p>
        </div>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-2 rounded-lg transition-all ${isLocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
        </button>
      </div>

      {/* Plan view */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/20"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${scale}) translate(${viewOffset.x}px, ${viewOffset.y}px)`
          }}
        >
          <svg
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="w-full h-full"
            style={{ maxHeight: '70vh' }}
          >
            {/* Grid */}
            <defs>
              <pattern id="buildingGrid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="hsl(var(--border))" strokeWidth="0.02"/>
              </pattern>
            </defs>
            <rect x={minX} y={minY} width={width} height={height} fill="url(#buildingGrid)" />

            {/* Rooms */}
            {project.rooms.map((room) => {
              const transformedVertices = getTransformedVertices(room);
              const pathData = transformedVertices.map((v, i) => 
                `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`
              ).join(' ') + ' Z';

              const centerX = transformedVertices.reduce((sum, v) => sum + v.x, 0) / transformedVertices.length;
              const centerY = transformedVertices.reduce((sum, v) => sum + v.y, 0) / transformedVertices.length;

              const isSelected = selectedRoom === room.id;

              return (
                <g 
                  key={room.id}
                  style={{ cursor: isLocked ? 'default' : 'move' }}
                  onPointerDown={(e) => handlePointerDown(e, room.id)}
                  onClick={() => handleRoomClick(room.id)}
                >
                  {/* Room fill */}
                  <path
                    d={pathData}
                    fill={room.color}
                    fillOpacity={isSelected ? 0.3 : 0.15}
                    stroke={isSelected ? 'hsl(var(--foreground))' : room.color}
                    strokeWidth={isSelected ? 0.12 : 0.08}
                    strokeLinejoin="round"
                  />

                  {/* Wall measurements */}
                  {transformedVertices.map((vertex, i) => {
                    const nextVertex = transformedVertices[(i + 1) % transformedVertices.length];
                    const midX = (vertex.x + nextVertex.x) / 2;
                    const midY = (vertex.y + nextVertex.y) / 2;
                    const wallLength = room.walls[i]?.length || 0;

                    return (
                      <text
                        key={i}
                        x={midX}
                        y={midY - 0.25}
                        textAnchor="middle"
                        fontSize="0.25"
                        fill="hsl(var(--muted-foreground))"
                        fontWeight="500"
                      >
                        {wallLength}m
                      </text>
                    );
                  })}

                  {/* Room label */}
                  <text
                    x={centerX}
                    y={centerY - 0.15}
                    textAnchor="middle"
                    fontSize="0.35"
                    fill="hsl(var(--foreground))"
                    fontWeight="600"
                  >
                    {room.name}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 0.25}
                    textAnchor="middle"
                    fontSize="0.28"
                    fill={room.color}
                    fontWeight="700"
                  >
                    {room.floor.area} m²
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="p-3 premium-card rounded-xl active:scale-95 transition-transform">
            <ZoomIn className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={handleZoomOut} className="p-3 premium-card rounded-xl active:scale-95 transition-transform">
            <ZoomOut className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={handleReset} className="p-3 premium-card rounded-xl active:scale-95 transition-transform">
            <RotateCcw className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Room controls */}
        {selectedRoom && !isLocked && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button 
              onClick={() => handleRotateRoom(-1)}
              className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
            >
              <RotateCcw className="h-5 w-5 text-foreground" />
            </button>
            <button 
              onClick={() => handleRotateRoom(1)}
              className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
            >
              <RotateCw className="h-5 w-5 text-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Room list */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {project.rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRoom === room.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span 
                className="inline-block w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: room.color }}
              />
              {room.name}
            </button>
          ))}
          <button
            onClick={onAddRoom}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-accent/10 text-accent border border-accent/30 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
}