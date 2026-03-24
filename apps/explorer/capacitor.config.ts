import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.aetheria.travel',
  appName: 'Aetheria',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  plugins: {
    Keyboard: {
      resize: 'body'
    }
  }
};

export default config;
