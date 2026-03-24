
# Aetheria: Your Smart Travel Companion

Aetheria is an advanced, AI-powered travel orchestration ecosystem designed to eliminate the cognitive load of logistics and amplify the depth of human exploration for the modern generation.

## 🛠 Prototyping & Admin Access

To test the multi-role capabilities of the platform, you can use the **Demo Admin** credentials or promote any account via the **Simulation Hub** on the **Admin Console**.

### Role Portals
The application is architected as three distinct experiences:
1.  **Explorer App** (`/`): The primary travel synthesis and booking experience.
2.  **Admin Console** (`/admin`): System diagnostics, finance auditing, and error logs.
3.  **Partner Hub** (`/vendor/dashboard`): Vendor-specific order fulfillment and financial yield monitoring.

## 📱 Mobile Deployment (Capacitor)

This application is pre-configured for **Capacitor**, enabling a single codebase to power your **Web, iOS, and Android** experiences simultaneously.

### 🚀 Steps to Generate APK (Android)
1. Ensure `next.config.ts` has `output: 'export'`.
2. Run `npm run build`.
3. Run `npx cap sync`.
4. Run `npx cap open android`.
5. In Android Studio: **Build > Build APK(s)**.

### 🍏 Steps to Generate IPA (iOS)
1. Ensure `next.config.ts` has `output: 'export'`.
2. Run `npm run build`.
3. Run `npx cap sync`.
4. Run `npx cap open ios`.
5. In Xcode: **Product > Archive > Distribute App**.

*For full details, see [Mobile Development Guide](./docs/mobile_development_guide.md).*

## 🛠 Strategic Roadmap to Production

Transitioning from this high-fidelity prototype to a live global network requires three key phases:

1. **Testing**: Auditing security rules, AI prompt edge-cases, and linguistic accuracy.
2. **Staging**: Configuring Secret Manager for API keys and profiling system performance.
3. **Live**: Swapping simulated financial logic for real payment gateways and custom domain activation.

*Refer to the [Production Roadmap](./docs/deployment_checklist.md) for detailed technical specifications.*

## 🚀 Prototype vs. Production

### What is "Real" (Live)
- **Generative AI:** All AI features (Itineraries, Translation, Vision Hub, **Carbon Synthesis**, **Layover Odyssey**, **eSIM Synthesis**) use live **Google Gemini 2.5**, **Imagen 4**, and **Veo 3**.
- **Ruth Assistant:** Context-aware chatbot reading live Firestore data.
- **Connectivity:** **Global eSIM** synthesis integrated with the Smart Wallet.
- **Sustainability:** **Carbon Synthesis** engine for real-time footprint calculation.
- **Database:** Live **Firebase Firestore** for all profiles, wallets, and bookings.
- **Authentication:** Live **Firebase Authentication**.

### What is "Mock" (Simulated)
- **Booking Services:** Flights, Hotels, and Cruises return high-quality simulated data. Transition to live market prices by replacing `src/ai/flows/search-*` with 3rd-party APIs (e.g., Amadeus).
- **Payment Processing:** Transactions use Firestore atomic increments. Production requires Stripe/PayPal integration.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Mobile Bridge:** Capacitor 7
- **AI Orchestration:** Google Genkit 1.x
- **Models:** Gemini 2.5 Flash, Imagen 4, Veo 3
- **Backend:** Firebase (Auth, Firestore, App Hosting)
- **Graphics:** Three.js (for VR Viewer)
