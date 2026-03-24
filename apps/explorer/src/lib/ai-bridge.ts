
import { ItineraryInput, ItineraryOutput } from '@aetheria/shared';

/**
 * @fileOverview The Aetheria AI Bridge.
 * Cross-application transport layer for static frontend environments.
 */

const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9003/api/ai';

export async function synthesizeItinerary(input: ItineraryInput): Promise<ItineraryOutput> {
  // If we are in a static build / Capacitor environment, we fetch from the live API node.
  try {
    const response = await fetch(`${API_BASE}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API Node Offline");
    return await response.json();
  } catch (error) {
    console.warn("AI Bridge: Falling back to local mock.", error);
    return {
      summary: `A mock journey to ${input.destination}. [OFFLINE MODE]`,
      dailyPlans: []
    };
  }
}
