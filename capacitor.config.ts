import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.housescanner.ios',
  appName: 'House Scanner',
  webDir: 'dist',
  // Temporarily disabled for local build - uncomment for hot-reload:
  // server: {
  //   url: 'https://269dd98a-e2c1-4449-a34a-5dec6da8ddb4.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#fafafa',
    allowsLinkPreview: false
  }
};

export default config;