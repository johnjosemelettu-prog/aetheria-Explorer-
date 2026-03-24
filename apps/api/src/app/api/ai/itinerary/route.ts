
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { ItinerarySchema, ItineraryOutputSchema } from '@aetheria/shared';

/**
 * @fileOverview Server-side AI Synthesis Node.
 * This app stays on the server and is NOT exported as static.
 */

const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = ItinerarySchema.parse(body);

    const response = await ai.generate({
      prompt: `You are the Aetheria Architect. Generate an odyssey for ${input.destination}. Vibe: ${input.vibe}.`,
      output: { schema: ItineraryOutputSchema },
    });

    return NextResponse.json(response.output);
  } catch (error: any) {
    console.error("AI Node Failure:", error);
    return NextResponse.json({ error: "Synthesis Interrupted" }, { status: 500 });
  }
}
