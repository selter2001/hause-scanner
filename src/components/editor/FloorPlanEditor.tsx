import { useState, useCallback, useRef, useEffect } from 'react';
import { Room } from '@/types/scan';
import { ZoomIn, ZoomOut, RotateCcw, Save, X, Move, Pencil } from 'lucide-react';
import { calculatePolygonArea, calculateDistance, roundTo } from '@/lib/geometry';

interface FloorPlanEditorProps {
  room: Room;
  onSave: (updatedRoom: Room) => void;
  onCancel: () => void;
}

export function FloorPlanEditor({ room, onSave, onCancel }: FloorPlanEditorProps) {
  const [scale, setScale] = useState(1);
  const [vertices, setVertices] = useState(() => 
    room.floor.vertices.map(v => ({ ...v }))
  );
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate bounds for SVG viewBox
  const padding = 2;
  const minX = Math.min(...vertices.map(v => v.x)) - padding;
  const maxX = Math.max(...vertices.map(v => v.x)) + padding;
  const minY = Math.min(...vertices.map(v => v.y)) - padding;
  const maxY = Math.max(...vertices.map(v => v.y)) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  // Calculate current measurements
  const currentArea = roundTo(calculatePolygonArea(vertices));
  const wallLengths = vertices.map((v, i) => {
    const next = vertices[(i + 1) % vertices.length];
    return roundTo(calculateDistance(v, next));
  });

  const pathData = vertices.map((v, i) => 
    `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`
  ).join(' ') + ' Z';

  const screenToSvg = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const svgPoint = pt.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }, []);

  const handleVertexPointerDown = useCallback((index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedVertex(index);
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || selectedVertex === null) return;
    
    const svgPoint = screenToSvg(e.clientX, e.clientY);
    
    setVertices(prev => prev.map((v, i) => 
      i === selectedVertex 
        ? { x: roundTo(svgPoint.x, 2), y: roundTo(svgPoint.y, 2) }
        : v
    ));
  }, [isDragging, selectedVertex, screenToSvg]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSave = useCallback(() => {
    // Recalculate all room measurements
    const newArea = roundTo(calculatePolygonArea(vertices));
    const newWalls = room.walls.map((wall, i) => {
      const start = vertices[i];
      const end = vertices[(i + 1) % vertices.length];
      const length = roundTo(calculateDistance(start, end));
      const area = roundTo(length * room.ceiling.height);
      return {
        ...wall,
        start: { ...wall.start, x: start.x, y: start.y },
        end: { ...wall.end, x: end.x, y: end.y },
        length,
        area
      };
    });

    const totalWallArea = roundTo(newWalls.reduce((sum, w) => sum + w.area, 0));
    const perimeter = roundTo(newWalls.reduce((sum, w) => sum + w.length, 0));

    const updatedRoom: Room = {
      ...room,
      floor: {
        ...room.floor,
        vertices: vertices.map(v => ({ ...v })),
        area: newArea
      },
      walls: newWalls,
      ceiling: {
        ...room.ceiling,
        area: newArea
      },
      totalWallArea,
      perimeter
    };

    onSave(updatedRoom);
  }, [vertices, room, onSave]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setVertices(room.floor.vertices.map(v => ({ ...v })));
    setSelectedVertex(null);
  };

  // Check if measurements changed
  const hasChanges = JSON.stringify(vertices) !== JSON.stringify(room.floor.vertices);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
              <Pencil className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Edit Floor Plan</h2>
              <p className="text-sm text-muted-foreground">
                Drag corners to adjust • {room.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor canvas */}
      <div 
        className="flex-1 min-h-0 relative overflow-hidden bg-muted/20"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `scale(${scale})` }}
        >
          <svg
            ref={svgRef}
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="w-full h-full max-w-md max-h-md touch-none"
            style={{ maxHeight: '55vh' }}
          >
            {/* Grid */}
            <defs>
              <pattern id="editGrid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="hsl(var(--border))" strokeWidth="0.02"/>
              </pattern>
            </defs>
            <rect x={minX} y={minY} width={width} height={height} fill="url(#editGrid)" />

            {/* Room floor */}
            <path
              d={pathData}
              fill="hsl(var(--accent) / 0.1)"
              stroke="hsl(var(--accent))"
              strokeWidth="0.08"
              strokeLinejoin="round"
            />

            {/* Walls with measurements */}
            {vertices.map((v, i) => {
              const next = vertices[(i + 1) % vertices.length];
              const midX = (v.x + next.x) / 2;
              const midY = (v.y + next.y) / 2;
              
              const dx = next.x - v.x;
              const dy = next.y - v.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offsetX = len > 0 ? (-dy / len) * 0.5 : 0;
              const offsetY = len > 0 ? (dx / len) * 0.5 : 0;
              
              return (
                <g key={`wall-${i}`}>
                  {/* Wall line */}
                  <line
                    x1={v.x}
                    y1={v.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="0.1"
                    strokeLinecap="round"
                  />
                  
                  {/* Measurement label */}
                  <rect
                    x={midX + offsetX - 0.6}
                    y={midY + offsetY - 0.22}
                    width="1.2"
                    height="0.44"
                    rx="0.1"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--accent))"
                    strokeWidth="0.03"
                  />
                  <text
                    x={midX + offsetX}
                    y={midY + offsetY + 0.1}
                    textAnchor="middle"
                    fontSize="0.32"
                    fill="hsl(var(--accent))"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {wallLengths[i]}m
                  </text>
                </g>
              );
            })}

            {/* Draggable vertices */}
            {vertices.map((v, i) => (
              <g key={`vertex-${i}`}>
                {/* Larger touch target */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r="0.5"
                  fill="transparent"
                  className="cursor-move"
                  onPointerDown={(e) => handleVertexPointerDown(i, e)}
                />
                {/* Visual vertex */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={selectedVertex === i ? "0.22" : "0.16"}
                  fill={selectedVertex === i ? "hsl(var(--accent))" : "hsl(var(--foreground))"}
                  stroke="hsl(var(--card))"
                  strokeWidth="0.06"
                  className="cursor-move pointer-events-none"
                />
                {/* Vertex label */}
                {selectedVertex === i && (
                  <text
                    x={v.x}
                    y={v.y - 0.4}
                    textAnchor="middle"
                    fontSize="0.28"
                    fill="hsl(var(--accent))"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    {v.x.toFixed(2)}, {v.y.toFixed(2)}
                  </text>
                )}
              </g>
            ))}

            {/* Center area label */}
            <text
              x={(minX + maxX) / 2}
              y={(minY + maxY) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="0.5"
              fill="hsl(var(--accent))"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              {currentArea} m²
            </text>
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
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

        {/* Drag hint */}
        <div className="absolute bottom-4 left-4">
          <div className="glass-card p-3 rounded-xl flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drag corners to edit</span>
          </div>
        </div>
      </div>

      {/* Stats comparison */}
      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Original</p>
            <p className="text-lg font-bold text-foreground">{room.floor.area} m²</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <p className="text-lg font-bold text-accent">{currentArea} m²</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Difference</p>
            <p className={`text-lg font-bold ${currentArea - room.floor.area >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {currentArea - room.floor.area >= 0 ? '+' : ''}{roundTo(currentArea - room.floor.area)} m²
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-muted text-muted-foreground font-medium active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-all ${
              hasChanges 
                ? 'premium-button' 
                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
