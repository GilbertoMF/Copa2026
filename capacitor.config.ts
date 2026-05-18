import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.copa2026.app',
  appName: 'Copa2026',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '185407563203-web.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
