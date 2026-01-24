import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { ScanProject } from '@/types/scan';
import { Suspense } from 'react';
import { Box, RotateCcw, Move3D } from 'lucide-react';

interface Room3DViewProps {
  project: ScanProject;
}

function RoomMesh({ project }: { project: ScanProject }) {
  const room = project.rooms[0];
  const vertices = room.floor.vertices;
  
  // Calculate center
  const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

  return (
    <group position={[-centerX, 0, -centerY]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, centerY]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Walls */}
      {room.walls.map((wall, i) => {
        const start = vertices[i];
        const end = vertices[(i + 1) % vertices.length];
        
        const length = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        
        const midX = (start.x + end.x) / 2;
        const midZ = (start.y + end.y) / 2;
        
        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        return (
          <mesh
            key={wall.id}
            position={[midX, room.ceiling.height / 2, midZ]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[length, room.ceiling.height, 0.15]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        );
      })}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[centerX, room.ceiling.height, centerY]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Ładowanie modelu 3D...</p>
      </div>
    </div>
  );
}

export function Room3DView({ project }: Room3DViewProps) {
  const room = project.rooms[0];

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

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2}
            />
            
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
            <pointLight position={[0, 3, 0]} intensity={0.3} />
            
            <RoomMesh project={project} />
            
            <Grid 
              position={[0, -0.01, 0]}
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#ddd"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#bbb"
              fadeDistance={30}
              fadeStrength={1}
            />
          </Canvas>
        </Suspense>

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
                <span>Szczypnij = Zoom</span>
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
