# Backpacker: Dataflow Documentation
*Mapping the Intelligence Ecosystem*

## 1. Primary Data Flows

### 1.1 Aesthetic Synthesis (Path Finder)
1.  **Input**: User uploads inspiration photo (Base64).
2.  **Validation**: System checks Smart Wallet for $5.00 synthesis fee.
3.  **Analysis**: Gemini 2.5 decodes visual vibes into geographical coordinates.
4.  **Generation**: System builds a "Draft" itinerary in Firestore.

### 1.2 SOS Emergency Protocol
1.  **Trigger**: User performs long-press on Panic Button.
2.  **Telemetry**: System fetches high-precision GPS coordinates.
3.  **Broadcast**: 
    *   Writes `SOS_PANIC` event to user's `safetyEvents` collection.
    *   Triggers browser-side high-frequency audible deterrent.
    *   Broadcasts location to verified Guardian contacts.

### 1.3 Financial Oracle (Budget Synthesis)
1.  **Input**: Ruth Assistant queries the `transactions` ledger.
2.  **Analysis**: System compares `amount` vs `itinerary.budget`.
3.  **Recommendation**: AI suggests "Smart Swaps" (lower-cost alternatives) to maintain trip vibes while preserving liquidity.

### 1.4 Cinematic Odyssey (Video)
1.  **Operation**: Server triggers Veo 3 operation (supports 9:16 vertical).
2.  **Polling**: System polls `ai.checkOperation` in 5s intervals.
3.  **Delivery**: Base64 data URI returned for instant social screening.

---
*Backpacker Systems • Dataflow Schema v2.0*
