import { ScanProject } from '@/types/scan';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface FloorPlanViewProps {
  project: ScanProject;
}

export function FloorPlanView({ project }: FloorPlanViewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const room = project.rooms[0];
  const vertices = room.floor.vertices;
  
  // Calculate bounds for SVG viewBox
  const minX = Math.min(...vertices.map(v => v.x));
  const maxX = Math.max(...vertices.map(v => v.x));
  const minY = Math.min(...vertices.map(v => v.y));
  const maxY = Math.max(...vertices.map(v => v.y));
  
  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 1;

  const pathData = vertices.map((v, i) => 
    `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`
  ).join(' ') + ' Z';

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border safe-area-inset">
        <h2 className="text-lg font-semibold text-foreground">Rzut z góry</h2>
        <p className="text-sm text-muted-foreground">{project.name} • {room.floor.area} m²</p>
      </div>

      {/* Floor plan */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/30"
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
          }}
        >
          <svg
            viewBox={`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`}
            className="w-full h-full max-w-md max-h-md"
            style={{ maxHeight: '60vh' }}
          >
            {/* Grid */}
            <defs>
              <pattern id="smallGrid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.02"/>
              </pattern>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="url(#smallGrid)"/>
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="hsl(var(--border))" strokeWidth="0.03"/>
              </pattern>
            </defs>
            <rect 
              x={minX - padding} 
              y={minY - padding} 
              width={width + padding * 2} 
              height={height + padding * 2} 
              fill="url(#grid)" 
            />

            {/* Room floor */}
            <path
              d={pathData}
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth="0.08"
              strokeLinejoin="round"
            />

            {/* Walls with thickness */}
            {room.walls.map((wall, i) => {
              const start = vertices[i];
              const end = vertices[(i + 1) % vertices.length];
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              
              return (
                <g key={wall.id}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="0.15"
                    strokeLinecap="round"
                  />
                  {/* Wall length label */}
                  <text
                    x={midX}
                    y={midY - 0.3}
                    textAnchor="middle"
                    fontSize="0.35"
                    fill="hsl(var(--muted-foreground))"
                    fontWeight="500"
                  >
                    {wall.length.toFixed(1)}m
                  </text>
                </g>
              );
            })}

            {/* Room label */}
            <text
              x={(minX + maxX) / 2}
              y={(minY + maxY) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.5"
              fill="hsl(var(--foreground))"
              fontWeight="600"
            >
              {room.name}
            </text>
            <text
              x={(minX + maxX) / 2}
              y={(minY + maxY) / 2 + 0.6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.35"
              fill="hsl(var(--muted-foreground))"
            >
              {room.floor.area} m²
            </text>
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-3 glass-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomIn className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 glass-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomOut className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={handleReset}
            className="p-3 glass-card rounded-xl active:scale-95 transition-transform"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Room info */}
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
