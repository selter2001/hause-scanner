import { ScanProject } from '@/types/scan';
import { Box, RotateCcw, Move3D, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface Room3DViewProps {
  project: ScanProject;
}

export function Room3DView({ project }: Room3DViewProps) {
  const room = project.rooms[0];
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [scale, setScale] = useState(1);

  const vertices = room.floor.vertices;
  const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

  // Simple isometric projection
  const project3D = (x: number, y: number, z: number) => {
    const cos = Math.cos((rotation.y * Math.PI) / 180);
    const sin = Math.sin((rotation.y * Math.PI) / 180);
    const cosX = Math.cos((rotation.x * Math.PI) / 180);
    const sinX = Math.sin((rotation.x * Math.PI) / 180);

    const rotatedX = (x - centerX) * cos - (y - centerY) * sin;
    const rotatedY = (x - centerX) * sin + (y - centerY) * cos;
    const rotatedZ = z;

    const projectedX = rotatedX;
    const projectedY = rotatedY * cosX - rotatedZ * sinX;

    return {
      x: 200 + projectedX * 30 * scale,
      y: 200 - projectedY * 30 * scale
    };
  };

  const floorPoints = vertices.map(v => project3D(v.x, v.y, 0));
  const ceilingPoints = vertices.map(v => project3D(v.x, v.y, room.ceiling.height));

  const floorPath = floorPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const ceilingPath = ceilingPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const handleRotate = (dx: number, dy: number) => {
    setRotation(prev => ({
      x: Math.max(0, Math.min(90, prev.x + dy)),
      y: prev.y + dx
    }));
  };

  const roomColor = room.color || 'hsl(var(--accent))';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl" 
            style={{ backgroundColor: `${roomColor}20` }}
          >
            <Box className="h-5 w-5" style={{ color: roomColor }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">3D View</h2>
            <p className="text-sm text-muted-foreground">{room.name} • {room.floor.area} m²</p>
          </div>
        </div>
      </div>

      {/* 3D View */}
      <div 
        className="flex-1 relative overflow-hidden bg-muted/20"
        onPointerDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          
          const onMove = (moveEvent: PointerEvent) => {
            const dx = (moveEvent.clientX - startX) * 0.5;
            const dy = (moveEvent.clientY - startY) * 0.5;
            handleRotate(dx, dy);
          };
          
          const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          };
          
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Floor */}
          <path
            d={floorPath}
            fill={roomColor}
            fillOpacity={0.15}
            stroke={roomColor}
            strokeWidth="2"
          />
          
          {/* Walls */}
          {vertices.map((v, i) => {
            const next = vertices[(i + 1) % vertices.length];
            const p1 = project3D(v.x, v.y, 0);
            const p2 = project3D(next.x, next.y, 0);
            const p3 = project3D(next.x, next.y, room.ceiling.height);
            const p4 = project3D(v.x, v.y, room.ceiling.height);
            
            const wallPath = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
            
            // Calculate wall center for measurement label
            const wallCenterX = (p1.x + p2.x + p3.x + p4.x) / 4;
            const wallCenterY = (p1.y + p2.y + p3.y + p4.y) / 4;
            const wallLength = room.walls[i]?.length || 0;
            
            return (
              <g key={i}>
                <path
                  d={wallPath}
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                  opacity={0.85}
                />
                {/* Wall measurement */}
                <text
                  x={wallCenterX}
                  y={wallCenterY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="500"
                  fill="hsl(var(--muted-foreground))"
                >
                  {wallLength}m
                </text>
              </g>
            );
          })}
          
          {/* Ceiling */}
          <path
            d={ceilingPath}
            fill="hsl(var(--secondary))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.4}
          />
          
          {/* Room label */}
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            {room.name}
          </text>
        </svg>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setScale(s => Math.min(s + 0.2, 2))}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomIn className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomOut className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => {
              setRotation({ x: 30, y: 45 });
              setScale(1);
            }}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Move3D className="h-4 w-4" />
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {rotation.x.toFixed(0)}° / {rotation.y.toFixed(0)}°
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room stats */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{room.walls.length}</p>
            <p className="text-xs text-muted-foreground">Walls</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: roomColor }}>{room.floor.area} m²</p>
            <p className="text-xs text-muted-foreground">Floor</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{room.totalWallArea} m²</p>
            <p className="text-xs text-muted-foreground">Walls</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{room.ceiling.height}m</p>
            <p className="text-xs text-muted-foreground">Height</p>
          </div>
        </div>
      </div>
    </div>
  );
}