import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.pawsy',
  appName: 'Pawsy',
  webDir: 'www',
  android: {
    allowMixedContent: true, // Permite URLs HTTP
  },
  server: {
    cleartext: true, // Permite tráfico HTTP claro
  },
};

export default config;
