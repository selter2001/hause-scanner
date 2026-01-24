import Foundation
import Capacitor
import RoomPlan

@objc(RoomPlanPlugin)
public class RoomPlanPlugin: CAPPlugin {
    
    private var captureSession: RoomCaptureSession?
    private var captureView: RoomCaptureView?
    private var finalResults: CapturedRoom?
    private var scanStartTime: Date?
    
    // MARK: - Plugin Methods
    
    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            call.resolve([
                "supported": RoomCaptureSession.isSupported,
                "version": "1.0"
            ])
        } else {
            call.resolve([
                "supported": false,
                "version": "1.0",
                "error": "iOS 16.0 or later required"
            ])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func startScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.scanStartTime = Date()
            
            let captureView = RoomCaptureView(frame: UIScreen.main.bounds)
            self.captureView = captureView
            
            let sessionConfig = RoomCaptureSession.Configuration()
            captureView.captureSession.run(configuration: sessionConfig)
            
            captureView.delegate = self
            
            // Present the capture view
            if let viewController = self.bridge?.viewController {
                viewController.view.addSubview(captureView)
            }
            
            call.resolve([
                "status": "scanning",
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func stopScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.captureView?.captureSession.stop()
            call.resolve([
                "status": "stopped",
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func getResults(_ call: CAPPluginCall) {
        guard let results = finalResults else {
            call.reject("No scan results available")
            return
        }
        
        // Process walls with detailed measurements
        var walls: [[String: Any]] = []
        var totalWallArea: Float = 0
        var perimeter: Float = 0
        
        for (index, wall) in results.walls.enumerated() {
            let length = wall.dimensions.x
            let height = wall.dimensions.y
            let area = length * height
            
            totalWallArea += area
            perimeter += length
            
            // Get wall position from transform matrix
            let position = wall.transform.columns.3
            
            let wallData: [String: Any] = [
                "id": "wall-\(index + 1)",
                "length": round(length * 100) / 100,
                "height": round(height * 100) / 100,
                "area": round(area * 100) / 100,
                "position": [
                    "x": round(position.x * 100) / 100,
                    "y": round(position.y * 100) / 100,
                    "z": round(position.z * 100) / 100
                ],
                "corners": [
                    ["x": position.x - length/2, "y": 0, "z": position.z],
                    ["x": position.x + length/2, "y": 0, "z": position.z],
                    ["x": position.x + length/2, "y": height, "z": position.z],
                    ["x": position.x - length/2, "y": height, "z": position.z]
                ]
            ]
            walls.append(wallData)
        }
        
        // Process floors
        var floors: [[String: Any]] = []
        var totalFloorArea: Float = 0
        
        for (index, floor) in results.floors.enumerated() {
            let width = floor.dimensions.x
            let depth = floor.dimensions.z
            let area = width * depth
            
            totalFloorArea += area
            
            let position = floor.transform.columns.3
            
            let floorData: [String: Any] = [
                "id": "floor-\(index + 1)",
                "width": round(width * 100) / 100,
                "depth": round(depth * 100) / 100,
                "area": round(area * 100) / 100,
                "position": [
                    "x": round(position.x * 100) / 100,
                    "y": round(position.y * 100) / 100,
                    "z": round(position.z * 100) / 100
                ],
                "vertices": [
                    ["x": position.x - width/2, "y": position.z - depth/2],
                    ["x": position.x + width/2, "y": position.z - depth/2],
                    ["x": position.x + width/2, "y": position.z + depth/2],
                    ["x": position.x - width/2, "y": position.z + depth/2]
                ]
            ]
            floors.append(floorData)
        }
        
        // Get ceiling height (average wall height)
        let avgHeight = walls.isEmpty ? 2.7 : totalWallArea / perimeter
        
        // Calculate scan duration
        let scanDuration = scanStartTime.map { Date().timeIntervalSince($0) } ?? 0
        
        call.resolve([
            "walls": walls,
            "floors": floors,
            "measurements": [
                "wallCount": results.walls.count,
                "totalWallArea": round(totalWallArea * 100) / 100,
                "totalFloorArea": round(totalFloorArea * 100) / 100,
                "ceilingArea": round(totalFloorArea * 100) / 100,
                "perimeter": round(perimeter * 100) / 100,
                "height": round(avgHeight * 100) / 100
            ],
            "metadata": [
                "scanDuration": round(scanDuration * 10) / 10,
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
        ])
    }
}

// MARK: - RoomCaptureViewDelegate

@available(iOS 16.0, *)
extension RoomPlanPlugin: RoomCaptureViewDelegate {
    
    public func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
        return true
    }
    
    public func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        self.finalResults = processedResult
        
        // Calculate quick measurements for notification
        var totalFloorArea: Float = 0
        for floor in processedResult.floors {
            totalFloorArea += floor.dimensions.x * floor.dimensions.z
        }
        
        // Remove capture view
        DispatchQueue.main.async { [weak self] in
            self?.captureView?.removeFromSuperview()
            self?.captureView = nil
        }
        
        // Notify JavaScript with summary
        self.notifyListeners("scanComplete", data: [
            "wallCount": processedResult.walls.count,
            "floorArea": round(totalFloorArea * 100) / 100,
            "status": "complete"
        ])
    }
}
