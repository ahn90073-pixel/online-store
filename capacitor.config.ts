import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ahn90073.onlinestore',
  appName: 'سوق اون لين',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorUpdater: {
      autoUpdate: false,
      appReadyTimeout: 10000,
      responseTimeout: 30,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
    },
  },
};

export default config;
