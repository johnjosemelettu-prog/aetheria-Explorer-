# Backpacker: Technical Documentation

## 1. Feature Implementation Details

### 1.1 Vertical Social Odyssey
Located in `src/ai/flows/generate-trip-video-flow.ts`. Upgraded to support `format: vertical` which triggers the **Veo 2** model specifically optimized for 9:16 aspect ratios.

### 1.2 Visual Path Finder Synthesis
Located in `/pathfinder`. Uses a two-step prompt logic:
1.  **Aesthetic Decode**: Analyzes image lighting and mood.
2.  **Destination Mapping**: Matches mood to a real-world city cluster.

### 1.3 SOS Audible Deterrent
Synthesized via `src/app/(main)/sos/page.tsx`. It uses an `OscillatorNode` with a `sawtooth` waveform, sweeping between 440Hz and 880Hz to create a standard high-frequency panic siren effect without requiring large audio files.

### 1.4 Budget Synthesis Logic
Analyzes the `transactions` sub-collection. It groups spending by `category` and provides a relative weight to the remaining days in the `Itinerary` to calculate a dynamic `dailyAllowance`.
