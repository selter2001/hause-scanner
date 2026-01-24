import Foundation
import Capacitor
import RoomPlan

@objc(RoomPlanPlugin)
public class RoomPlanPlugin: CAPPlugin {
    
    private var captureSession: RoomCaptureSession?
    private var captureView: RoomCaptureView?
    private var finalResults: CapturedRoom?
    
    @objc func isSupported(_ call: CAPPluginCall) {
        if #available(iOS 16.0, *) {
            call.resolve(["supported": RoomCaptureSession.isSupported])
        } else {
            call.resolve(["supported": false])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func startScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            let captureView = RoomCaptureView(frame: UIScreen.main.bounds)
            self.captureView = captureView
            
            let sessionConfig = RoomCaptureSession.Configuration()
            captureView.captureSession.run(configuration: sessionConfig)
            
            captureView.delegate = self
            
            // Present the capture view
            if let viewController = self.bridge?.viewController {
                viewController.view.addSubview(captureView)
            }
            
            call.resolve(["status": "scanning"])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func stopScan(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.captureView?.captureSession.stop()
            call.resolve(["status": "stopped"])
        }
    }
    
    @available(iOS 16.0, *)
    @objc func getResults(_ call: CAPPluginCall) {
        guard let results = finalResults else {
            call.reject("No scan results available")
            return
        }
        
        var walls: [[String: Any]] = []
        for (index, wall) in results.walls.enumerated() {
            let wallData: [String: Any] = [
                "id": "wall-\(index)",
                "width": wall.dimensions.x,
                "height": wall.dimensions.y,
                "length": wall.dimensions.z,
                "area": wall.dimensions.x * wall.dimensions.y,
                "transform": [
                    wall.transform.columns.3.x,
                    wall.transform.columns.3.y,
                    wall.transform.columns.3.z
                ]
            ]
            walls.append(wallData)
        }
        
        var floors: [[String: Any]] = []
        for (index, floor) in results.floors.enumerated() {
            let floorData: [String: Any] = [
                "id": "floor-\(index)",
                "width": floor.dimensions.x,
                "length": floor.dimensions.z,
                "area": floor.dimensions.x * floor.dimensions.z,
                "transform": [
                    floor.transform.columns.3.x,
                    floor.transform.columns.3.y,
                    floor.transform.columns.3.z
                ]
            ]
            floors.append(floorData)
        }
        
        call.resolve([
            "walls": walls,
            "floors": floors,
            "wallCount": results.walls.count,
            "totalFloorArea": floors.reduce(0) { $0 + ($1["area"] as? Float ?? 0) }
        ])
    }
}

@available(iOS 16.0, *)
extension RoomPlanPlugin: RoomCaptureViewDelegate {
    
    public func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
        return true
    }
    
    public func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        self.finalResults = processedResult
        
        // Remove capture view
        DispatchQueue.main.async { [weak self] in
            self?.captureView?.removeFromSuperview()
            self?.captureView = nil
        }
        
        // Notify JavaScript
        self.notifyListeners("scanComplete", data: [
            "wallCount": processedResult.walls.count,
            "status": "complete"
        ])
    }
}
