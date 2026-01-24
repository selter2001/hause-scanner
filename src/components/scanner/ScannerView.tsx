import { ScanProgress } from '@/types/scan';
import { Scan, Square, Ruler, X } from 'lucide-react';

interface ScannerViewProps {
  progress: ScanProgress;
  onStartScan: () => void;
  onStopScan: () => void;
}

export function ScannerView({ progress, onStartScan, onStopScan }: ScannerViewProps) {
  return (
    <div className="relative h-full w-full bg-foreground overflow-hidden">
      {/* Camera view simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-muted/30">
        {/* AR Corner markers */}
        {progress.isScanning && (
          <div className="absolute inset-8">
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-accent" />
            <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-accent" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-accent" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-accent" />
          </div>
        )}

        {/* Scanning grid overlay */}
        {progress.isScanning && (
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="scanGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scanGrid)" />
            </svg>
          </div>
        )}

        {/* Wall detection visualization */}
        {progress.isScanning && progress.detectedWalls > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(Math.min(progress.detectedWalls, 4))].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 border-accent/80 rounded-sm"
                style={{
                  left: `${12 + i * 22}%`,
                  top: `${18 + (i % 2) * 25}%`,
                  width: `${18}%`,
                  height: `${28}%`,
                }}
              >
                {/* Measurement label on wall */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded">
                  {(2 + Math.random() * 3).toFixed(2)} m
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scan progress line */}
        {progress.isScanning && (
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-x-0 h-0.5 bg-accent"
              style={{
                top: `${progress.progress % 100}%`,
                boxShadow: '0 0 20px hsl(var(--accent)), 0 0 40px hsl(var(--accent))'
              }}
            />
          </div>
        )}
      </div>

      {/* Top status bar */}
      <div className="absolute top-0 inset-x-0 safe-area-inset">
        <div className="mx-4 mt-4 p-4 rounded-2xl glass-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                progress.isScanning ? 'bg-accent' : 'bg-muted'
              }`}>
                <Scan className={`h-5 w-5 ${progress.isScanning ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {progress.status === 'idle' && 'Ready to scan'}
                  {progress.status === 'scanning' && 'Scanning...'}
                  {progress.status === 'complete' && 'Complete!'}
                  {progress.status === 'error' && 'Error'}
                </p>
                <p className="text-xs text-muted-foreground">{progress.message || 'Point camera at walls'}</p>
              </div>
            </div>
            {progress.isScanning && (
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">{Math.round(progress.progress)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Measurements panel */}
      {(progress.isScanning || progress.status === 'complete') && (
        <div className="absolute bottom-36 inset-x-0 px-4">
          <div className="p-5 rounded-2xl glass-card">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ruler className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Walls</p>
                  <p className="text-2xl font-bold text-foreground">{progress.detectedWalls}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Square className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Area</p>
                  <p className="text-2xl font-bold text-foreground">{progress.currentArea.toFixed(1)} <span className="text-base font-normal">m²</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main action button */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center safe-area-inset">
        <button
          onClick={progress.isScanning ? onStopScan : onStartScan}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200 active:scale-95
            ${progress.isScanning 
              ? 'bg-card border-4 border-destructive' 
              : 'bg-primary'
            }
          `}
          style={{
            boxShadow: progress.isScanning 
              ? '0 0 0 4px hsl(var(--destructive) / 0.2), 0 8px 32px -4px hsl(0 0% 0% / 0.3)'
              : '0 8px 32px -4px hsl(0 0% 0% / 0.4)'
          }}
        >
          {progress.isScanning ? (
            <div className="w-7 h-7 bg-destructive rounded-sm" />
          ) : (
            <Scan className="w-8 h-8 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}