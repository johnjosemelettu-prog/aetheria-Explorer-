import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.aetheria.travel',
  appName: 'Aetheria',
  webDir: 'apps/explorer/out',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'aetheria.travel'
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#020617', // Match Slate 950
    scrollEnabled: true // Allow the webview to be scrollable
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#020617', // Match Slate 950
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "light",
      backgroundColor: '#020617' // Match Slate 950
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_SERVER_CLIENT_ID', // Replace with your server client ID
      forceCodeForRefreshToken: true,
    },
    NativeBiometric: {
      scopes: ['fingerprint', 'faceid'],
    },
    Keyboard: {
      resize: 'body'
    }
  },
  cordova: {
    preferences: {
      resultAccumulatorTimeout: '60000',
    }
  }
};

export default config;