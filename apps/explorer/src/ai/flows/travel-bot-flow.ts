
import { z } from 'zod';

/**
 * @fileOverview A specialized AI assistant for the Aetheria app, named Ruth.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const ChatMessageSchema = z.object({
  role: z.string().describe("The role of the message sender (user or model)."),
  content: z.string(),
});

const TravelBotInputSchema = z.object({
  uid: z.string().describe("The user's unique identifier."),
  messages: z.array(ChatMessageSchema).describe("The conversation history."),
  language: z.string().optional().describe("The output language."),
});
export type TravelBotInput = z.infer<typeof TravelBotInputSchema>;

const TravelBotOutputSchema = z.object({
  text: z.string().describe("The AI's response text."),
});
export type TravelBotOutput = z.infer<typeof TravelBotOutputSchema>;

/**
 * Solves travel queries. Environment-aware logic for static export / Capacitor.
 */
export async function solveTravelQuery(input: TravelBotInput): Promise<TravelBotOutput> {
  if (typeof window !== 'undefined') {
    return { 
      text: "Hello! I am Ruth, your simulated Aetheria Assistant. In this prototype mode, I am providing a high-fidelity response mock because the AI synthesis engine is only available in the hosted environment." 
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const { initializeFirebase } = await import('@/firebase');
    const { collection, getDocs, doc, getDoc, query, orderBy, limit } = await import('firebase/firestore');

    const { firestore } = initializeFirebase();
    if (!firestore) throw new Error("Firestore node offline.");
    
    const [profileSnap, itinerariesSnap, flightsSnap, hotelsSnap] = await Promise.all([
      getDoc(doc(firestore, 'userProfiles', input.uid)),
      getDocs(query(collection(firestore, 'userProfiles', input.uid, 'itineraries'), orderBy('updatedAt', 'desc'), limit(3))),
      getDocs(collection(firestore, 'userProfiles', input.uid, 'flightBookings')),
      getDocs(collection(firestore, 'userProfiles', input.uid, 'hotelRoomBookings')),
    ]);

    const profile = profileSnap.data();
    const itineraries = itinerariesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const bookings = {
      flights: flightsSnap.docs.map(d => d.data()),
      hotels: hotelsSnap.docs.map(d => d.data()),
    };

    const activeTier = (itineraries[0] as any)?.subscriptionTier || 'free';

    const systemPrompt = `You are "Ruth," the assistant for Aetheria.
    
**USER DATA CONTEXT:**
- **Explorer:** ${profile?.firstName || 'User'}
- **Active Tier:** ${activeTier}
- **Current Itineraries:** ${JSON.stringify(itineraries)}
- **Confirmed Bookings:** ${JSON.stringify(bookings)}

Respond to the user's latest message. Language: ${input.language || 'English'}.`;

    const response = await ai.generate({
      system: systemPrompt,
      messages: input.messages.map(m => ({
        role: m.role as any,
        content: [{ text: m.content }]
      })),
    });

    return { text: response.text || "I'm having trouble synthesizing a response." };
  } catch (error) {
    console.error("Travel Bot node failure:", error);
    return { text: "I'm having a little trouble connecting to the Aetheria AI network. Please check your data node." };
  }
}
