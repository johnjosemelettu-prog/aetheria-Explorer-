# Technical Architecture Document: Backpacker AI

## 1. System Overview
Backpacker is a high-fidelity decoupled architecture.

### AI Flow Orchestration (Genkit)
- **Multimodal**: Uses Gemini 2.5 for vision analysis (Menu, Art, Souvenir, Meds).
- **Cinematic**: Veo 3 for horizontal and vertical teaser synthesis.
- **Reasoning**: Financial Oracle (Budget Synthesis) and Visa Architect logic.

### Smart Wallet Protocol
- **Ledger**: Every debit/credit event is written to a user-isolated `transactions` collection.
- **Atomic Logic**: Balance updates use `increment()` to ensure consistency across concurrent sessions.

### Safety Guardian Grid
- **GPS Heartbeat**: SOS Hub transmits coordinates to a safety node in Firestore.
- **Audible Synthesis**: Uses the Web Audio API to generate deterrent frequencies directly in the browser.

## 2. Standard Operating Procedures
All booking components (Flight, Hotel, etc.) share a unified `Step-Progress` model:
1.  **Search**: Parameter input.
2.  **Selection**: Result display.
3.  **Verification**: Legal identity and address capture.
4.  **Authorization**: Final Smart Wallet handshake.
