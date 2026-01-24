# House Scanner - iOS Native Integration

This folder contains the native Swift code for the House Scanner app, specifically the RoomPlan API integration.

## RoomPlanPlugin.swift

A Capacitor plugin that bridges the iOS RoomPlan API to the web application.

### Requirements

- iOS 16.0 or later
- iPhone with LiDAR sensor (iPhone 12 Pro, 13 Pro, 14 Pro, 15 Pro, 16 Pro)
- Xcode 14.0 or later

### Features

- **Real-time room scanning** using Apple's RoomPlan API
- **Automatic wall detection** with precise measurements
- **Floor area calculation** in real-time
- **Detailed measurements export**:
  - Wall dimensions (length, height, area)
  - Floor vertices for 2D floor plan rendering
  - Total wall area for painting/finishing estimates
  - Room perimeter for baseboard/trim calculations
  - Ceiling height

### Installation

After exporting the project to GitHub and adding the iOS platform:

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. Copy `RoomPlanPlugin.swift` to the `App/App/` folder

3. Register the plugin in `AppDelegate.swift`:
   ```swift
   import RoomPlan
   
   // In application(_:didFinishLaunchingWithOptions:):
   bridge?.registerPlugin(RoomPlanPlugin.self)
   ```

4. Add permissions to `Info.plist`:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>House Scanner needs camera access to scan rooms and measure walls.</string>
   ```

5. Add the RoomPlan framework:
   - Project Settings → General → Frameworks, Libraries, and Embedded Content
   - Add `RoomPlan.framework`

### Plugin Methods

```javascript
// Check if RoomPlan is supported
const { supported } = await RoomPlanPlugin.isSupported();

// Start scanning
await RoomPlanPlugin.startScan();

// Stop scanning
await RoomPlanPlugin.stopScan();

// Get detailed results after scan complete
const results = await RoomPlanPlugin.getResults();
```

### Events

```javascript
// Listen for scan completion
RoomPlanPlugin.addListener('scanComplete', (data) => {
  console.log('Walls detected:', data.wallCount);
  console.log('Floor area:', data.floorArea);
});
```

### Result Structure

```javascript
{
  walls: [
    {
      id: "wall-1",
      length: 4.25,
      height: 2.70,
      area: 11.48,
      position: { x: 0, y: 0, z: 0 },
      corners: [...]
    }
  ],
  floors: [
    {
      id: "floor-1",
      width: 4.25,
      depth: 3.80,
      area: 16.15,
      vertices: [...]
    }
  ],
  measurements: {
    wallCount: 4,
    totalWallArea: 45.92,
    totalFloorArea: 16.15,
    ceilingArea: 16.15,
    perimeter: 16.10,
    height: 2.70
  },
  metadata: {
    scanDuration: 45.2,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

### Building for App Store

1. Ensure you have a valid Apple Developer account
2. Configure code signing in Xcode
3. Update `capacitor.config.ts` with production settings (remove server URL)
4. Archive and submit through Xcode or Transporter

## Troubleshooting

- **"RoomPlan not supported"**: Device doesn't have LiDAR sensor or iOS version is below 16.0
- **Camera permission denied**: Check Settings → House Scanner → Camera
- **Low quality scan**: Ensure good lighting and move slowly around the room
