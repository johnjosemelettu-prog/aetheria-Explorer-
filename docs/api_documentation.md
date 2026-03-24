# Backpacker: API Documentation

This document outlines the available REST API endpoints and the internal AI "flows" that power the Backpacker application. These are designed for high-fidelity native mobile integration.

## 1. Authentication APIs (REST)

Designed for native mobile conversion. These bypass the browser-based popup flow.

### 1.1 Login Proxy
*   **Endpoint:** `POST /api/auth/login`
*   **Payload:** `{ "email": "user@example.com", "password": "..." }`
*   **Returns:** Auth token and basic user metadata.

### 1.2 Signup Proxy
*   **Endpoint:** `POST /api/auth/signup`
*   **Payload:** `{ "email": "...", "password": "...", "firstName": "...", "lastName": "...", "nationality": "...", "homeBase": "..." }`
*   **Purpose:** Creates Auth user, Firestore profile, and triggers the AI Welcome synthesis.

---

## 2. Mobile Data Aggregation

### 2.1 Mobile Aggregator
*   **Endpoint:** `GET /api/mobile/aggregator`
*   **Purpose:** Fetches a comprehensive "snapshot" of the home screen data (itineraries, news, suggestions, achievements) in a single call to reduce latency.

### 2.2 User Context Aggregator
*   **Endpoint:** `GET /api/mobile/user-context?uid={uid}`
*   **Purpose:** Fetches the Smart Wallet balances, Loyalty tier, and active Journey Pass status for a specific user.

---

## 3. Internal AI "Flows" (Server Actions)

Powered by **Genkit 1.x**, these represent the logical engine of the platform.

### 3.1 Synthesis & Creative
*   **Trip Odyssey:** `generateTripVideo`. Veo 3 cinematic teasers (Supports 9:16 Vertical).
*   **Chronos Lens:** `generateHistoricalImage`. Landmark-based historical reconstruction.
*   **Visual Path Finder:** `synthesizeFromPhoto`. Aesthetic-to-itinerary synthesis.
*   **Postcard Studio:** `generatePostcard`. Imagen 4 artistic snap transformation.

### 3.2 Support & Logistics
*   **Ruth AI Assistant:** `solveTravelQuery`. Context-aware chatbot reading live Firestore context.
*   **Visa Architect:** `checkVisaRequirements`. Cross-border compliance logic.
*   **Budget Synthesis:** `generateBudgetAdvice`. The Financial Oracle for Smart Swaps.
*   **eSIM Synthesis:** `generateEsimPlan`. Destination-aware connectivity.

---

## 4. Financial Protocols
All financial actions (Gifting, Booking, Exchanging) require authorization via the `Smart Wallet` logic. Mutations are handled via atomic `increment()` operations in Firestore.

```
