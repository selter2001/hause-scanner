#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// This file registers the Swift RoomPlan plugin with Capacitor
CAP_PLUGIN(RoomPlanPlugin, "RoomPlanPlugin",
    CAP_PLUGIN_METHOD(isSupported, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(startScan, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopScan, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getResults, CAPPluginReturnPromise);
)
