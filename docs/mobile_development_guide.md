
# Aetheria: Mobile Development Guide
*Version 0.0.4 • High-Fidelity Synthesis Protocol*

This document outlines the protocol for generating previews and production binaries for the Aetheria ecosystem.

## 1. Resolving Gradle Errors (Clean Re-Sync)
If you encounter errors like `capacitor.settings.gradle not found` in Android Studio, your native platform node is in a corrupted state. Perform a **Logic Reset**:

```bash
npm run android:clean
```
*This command will: 1. Purge the existing android directory. 2. Re-initialize the native node. 3. Re-synthesize all web assets.*

## 2. Standard Native Platform Node Initialization
Before running on a device for the first time, you must initialize the native platform nodes.

### 🤖 Android Node
1. Ensure Android Studio is installed.
2. Run the initialization script:
   ```bash
   npm run android:init
   ```

## 3. Aetheria Hybrid Synthesis Protocol

### 3.1 UI/UX Shell Preview (Static)
Use this mode to check the mobile UI, layouts, and navigation in Android Studio.
1. Ensure `next.config.ts` has `output: 'export'`.
2. Execute the sync chain:
   ```bash
   npm run android:sync
   ```
*Note: AI flows and API-dependent features will be offline in this mode unless pointed to a live neural node (see below).*

### 3.2 Full Neural Integration (Hosted)
Use this mode for production testing where **all AI features (Itineraries, Video, Translation) are active**.
1. Deploy the application to **Firebase App Hosting**.
2. Update `capacitor.config.ts`:
   ```ts
   server: {
     url: 'https://your-app-id.web.app',
     allowNavigation: ['your-app-id.web.app']
   }
   ```
3. Run `npx cap sync`. This points the mobile shell to your live neural node.

## 4. Native Permissions
The Aetheria grid requires access to the device's sensory nodes. Ensure the following are authorized in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

---
*Aetheria AI Systems • Mobile Engineering Division 2026*
