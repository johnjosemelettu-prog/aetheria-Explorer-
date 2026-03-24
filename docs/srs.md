# Software Requirements Specification (SRS): Backpacker

## 1. Functional Requirements
- **FR-9**: System MUST support long-press activation for SOS protocols to prevent accidental triggers.
- **FR-10**: AI Trip Odyssey MUST support 9:16 vertical video synthesis for social sharing.
- **FR-11**: The Smart Wallet MUST perform real-time balance verification before authorizing any $2.99+ synthesis or marketplace purchase.
- **FR-12**: Visa Architect MUST match explorer nationality to destination entry protocols.

## 2. Non-Functional Requirements
- **NFR-5**: Video synthesis (Veo 3) response time expectation is 60-90s with active polling UI.
- **NFR-6**: Financial transactions MUST utilize Firestore atomic increments for data integrity.
- **NFR-7**: Emergency SOS location logging MUST occur within <3 seconds of trigger.

## 3. Technical Constraints
- **Engine**: Google Genkit 1.x (Gemini 2.5 Flash, Imagen 4, Veo 3).
- **Backend**: Firebase Firestore (Authorization Independence architecture).
