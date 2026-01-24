import { ScanProject } from '@/types/scan';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  const padding = 1.5;

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
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">2D Floor Plan</h2>
        <p className="text-sm text-muted-foreground">{room.name} • {room.floor.area} m²</p>
      </div>

      {/* Floor plan */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/20"
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
                <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="hsl(var(--border))" strokeWidth="0.01"/>
              </pattern>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="url(#smallGrid)"/>
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="hsl(var(--border))" strokeWidth="0.02"/>
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
              fill="hsl(var(--accent) / 0.08)"
              stroke="hsl(var(--foreground))"
              strokeWidth="0.08"
              strokeLinejoin="round"
            />

            {/* Walls with measurements */}
            {room.walls.map((wall, i) => {
              const start = vertices[i];
              const end = vertices[(i + 1) % vertices.length];
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              
              // Calculate offset for label positioning
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offsetX = (-dy / len) * 0.4;
              const offsetY = (dx / len) * 0.4;
              
              return (
                <g key={wall.id}>
                  {/* Wall line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="0.12"
                    strokeLinecap="round"
                  />
                  
                  {/* Measurement label background */}
                  <rect
                    x={midX + offsetX - 0.5}
                    y={midY + offsetY - 0.18}
                    width="1"
                    height="0.36"
                    rx="0.08"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.02"
                  />
                  
                  {/* Measurement text */}
                  <text
                    x={midX + offsetX}
                    y={midY + offsetY + 0.08}
                    textAnchor="middle"
                    fontSize="0.28"
                    fill="hsl(var(--foreground))"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    {wall.length}m
                  </text>
                </g>
              );
            })}

            {/* Corner points */}
            {vertices.map((vertex, i) => (
              <circle
                key={i}
                cx={vertex.x}
                cy={vertex.y}
                r="0.1"
                fill="hsl(var(--foreground))"
              />
            ))}

            {/* Room label */}
            <text
              x={(minX + maxX) / 2}
              y={(minY + maxY) / 2 - 0.2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.4"
              fill="hsl(var(--foreground))"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {room.name}
            </text>
            <text
              x={(minX + maxX) / 2}
              y={(minY + maxY) / 2 + 0.35}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.32"
              fill="hsl(var(--accent))"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              {room.floor.area} m²
            </text>
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomIn className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <ZoomOut className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={handleReset}
            className="p-3 premium-card rounded-xl active:scale-95 transition-transform"
          >
            <RotateCcw className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Room info */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{room.walls.length}</p>
            <p className="text-xs text-muted-foreground">Walls</p>
          </div>
          <div>
            <p className="text-xl font-bold text-accent">{room.floor.area} m²</p>
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