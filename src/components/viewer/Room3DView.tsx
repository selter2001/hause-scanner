import { ScanProject } from '@/types/scan';
import { Box, RotateCcw, Move3D, Eye } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border safe-area-inset">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Podgląd 3D</h2>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>
      </div>

      {/* 3D View */}
      <div 
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-muted/30 to-muted/50"
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
          {/* Grid */}
          <defs>
            <pattern id="grid3d" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
            </pattern>
          </defs>
          
          {/* Floor */}
          <path
            d={floorPath}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
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
            
            return (
              <path
                key={i}
                d={wallPath}
                fill="hsl(var(--card))"
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                opacity={0.9}
              />
            );
          })}
          
          {/* Ceiling */}
          <path
            d={ceilingPath}
            fill="hsl(var(--secondary))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.5}
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
            className="p-3 glass-card rounded-xl active:scale-95 transition-transform"
          >
            <Eye className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setRotation({ x: 30, y: 45 })}
            className="p-3 glass-card rounded-xl active:scale-95 transition-transform"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Przeciągnij = Obróć</span>
              </div>
              <div className="flex items-center gap-2">
                <Move3D className="h-4 w-4" />
                <span>Kąt: {rotation.x.toFixed(0)}° / {rotation.y.toFixed(0)}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room stats */}
      <div className="p-4 border-t border-border glass-card safe-area-inset">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{room.walls.length}</p>
            <p className="text-xs text-muted-foreground">Ściany</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{room.floor.area} m²</p>
            <p className="text-xs text-muted-foreground">Powierzchnia</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{room.ceiling.height}m</p>
            <p className="text-xs text-muted-foreground">Wysokość</p>
          </div>
        </div>
      </div>
    </div>
  );
}
