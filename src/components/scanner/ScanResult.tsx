import { useState } from 'react';
import { Room } from '@/types/scan';
import { Check, X, Ruler, Square, ArrowUpDown, Grid3X3 } from 'lucide-react';

interface ScanResultProps {
  room: Room;
  onConfirm: (roomName: string) => void;
  onCancel: () => void;
}

export function ScanResult({ room, onConfirm, onCancel }: ScanResultProps) {
  const [roomName, setRoomName] = useState(room.name);

  const quickNames = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Hallway'];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border safe-area-inset">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
        >
          <X className="h-6 w-6 text-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Scan Complete</h2>
        <button
          onClick={() => onConfirm(roomName)}
          className="p-2 -mr-2 rounded-xl bg-primary active:scale-95 transition-all"
        >
          <Check className="h-6 w-6 text-primary-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Room Name Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name..."
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <div className="flex flex-wrap gap-2">
            {quickNames.map((name) => (
              <button
                key={name}
                onClick={() => setRoomName(name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  roomName === name
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Measurements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="premium-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Square className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Floor Area</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {room.floor.area} <span className="text-base font-normal text-muted-foreground">m²</span>
            </p>
          </div>

          <div className="premium-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Wall Area</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {room.totalWallArea} <span className="text-base font-normal text-muted-foreground">m²</span>
            </p>
          </div>

          <div className="premium-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <ArrowUpDown className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Height</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {room.ceiling.height} <span className="text-base font-normal text-muted-foreground">m</span>
            </p>
          </div>

          <div className="premium-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Ruler className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Perimeter</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {room.perimeter} <span className="text-base font-normal text-muted-foreground">m</span>
            </p>
          </div>
        </div>

        {/* Wall Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Wall Measurements</h3>
          <div className="space-y-2">
            {room.walls.map((wall, index) => (
              <div
                key={wall.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-sm font-semibold text-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Wall {index + 1}</p>
                    <p className="text-xs text-muted-foreground">{wall.height}m height</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{wall.length}m</p>
                  <p className="text-xs text-muted-foreground">{wall.area} m²</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ceiling */}
        <div className="premium-card p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Ceiling</p>
              <p className="text-xs text-muted-foreground">Same as floor area</p>
            </div>
            <p className="text-lg font-bold text-foreground">{room.ceiling.area} m²</p>
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="p-4 border-t border-border safe-area-inset">
        <button
          onClick={() => onConfirm(roomName)}
          className="w-full py-4 rounded-xl premium-button text-center font-semibold"
        >
          Save Room
        </button>
      </div>
    </div>
  );
}