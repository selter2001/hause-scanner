import { useEffect, useRef } from 'react';
import { ScanProgress } from '@/types/scan';
import { Scan, Square, Ruler } from 'lucide-react';

interface ScannerViewProps {
  progress: ScanProgress;
  onStartScan: () => void;
  onStopScan: () => void;
}

export function ScannerView({ progress, onStartScan, onStopScan }: ScannerViewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Camera view simulation */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40"
      >
        {/* AR Overlay Grid */}
        {progress.isScanning && (
          <div className="absolute inset-0">
            <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Scanning animation */}
        {progress.isScanning && (
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
              style={{
                top: `${(progress.progress % 100)}%`,
                boxShadow: '0 0 20px hsl(var(--primary))'
              }}
            />
          </div>
        )}

        {/* Wall detection indicators */}
        {progress.isScanning && progress.detectedWalls > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(Math.min(progress.detectedWalls, 4))].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 border-accent rounded-lg animate-pulse"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 2) * 30}%`,
                  width: `${15 + Math.random() * 10}%`,
                  height: `${25 + Math.random() * 15}%`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top info bar */}
      <div className="absolute top-0 inset-x-0 safe-area-inset">
        <div className="glass-card mx-4 mt-4 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${progress.isScanning ? 'scanner-gradient' : 'bg-muted'}`}>
                <Scan className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {progress.status === 'idle' && 'Gotowy do skanowania'}
                  {progress.status === 'scanning' && 'Skanowanie...'}
                  {progress.status === 'complete' && 'Zakończono!'}
                  {progress.status === 'error' && 'Błąd'}
                </p>
                <p className="text-xs text-muted-foreground">{progress.message}</p>
              </div>
            </div>
            {progress.isScanning && (
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{Math.round(progress.progress)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      {(progress.isScanning || progress.status === 'complete') && (
        <div className="absolute bottom-32 inset-x-0 px-4">
          <div className="glass-card p-4 rounded-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ściany</p>
                  <p className="text-lg font-bold text-foreground">{progress.detectedWalls}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Square className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Powierzchnia</p>
                  <p className="text-lg font-bold text-foreground">{progress.currentArea} m²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan button */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center safe-area-inset">
        <button
          onClick={progress.isScanning ? onStopScan : onStartScan}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 active:scale-95
            ${progress.isScanning 
              ? 'bg-destructive shadow-lg' 
              : 'scanner-gradient shadow-xl'
            }
          `}
          style={{
            boxShadow: progress.isScanning 
              ? '0 0 30px hsl(var(--destructive) / 0.5)'
              : '0 0 30px hsl(var(--primary) / 0.5)'
          }}
        >
          {progress.isScanning ? (
            <div className="w-6 h-6 bg-white rounded-sm" />
          ) : (
            <Scan className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
