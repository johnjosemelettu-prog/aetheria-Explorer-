
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

/**
 * @fileOverview Server-side Heritage Synthesis Node.
 * Handles Imagen 4 persona reconstruction tasks.
 */

const ai = genkit({
  plugins: [googleAI()],
});

const HeritageInputSchema = z.object({
  photoDataUri: z.string(),
  location: z.string(),
  language: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = HeritageInputSchema.parse(body);

    // 1. Generate the artistic prompt for traditional attire
    const promptResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Identify the most iconic traditional, historical attire for someone in ${input.location}. 
      Describe a high-fidelity cinematic portrait of a person wearing this specific outfit. 
      Include textures, colors, and historical context. Return ONLY the descriptive prompt for an image generator.`
    });

    const artPrompt = `A high-fidelity cinematic portrait of the person in the provided photo reimagined exactly as described: ${promptResponse.text}. Photorealistic, heritage accuracy, 4k, soft studio lighting.`;

    // 2. Synthesize the image via Imagen 4
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: artPrompt,
    });

    if (!media || !media.url) throw new Error('Heritage synthesis node returned no data.');

    // 3. Generate historical context
    const contextResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Provide a single, sophisticated paragraph in ${input.language || 'English'} explaining the historical significance of the traditional attire from ${input.location} featured in this portrait.`,
    });

    return NextResponse.json({
      portraitUrl: media.url,
      historicalContext: contextResponse.text,
    });
  } catch (error: any) {
    console.error("Heritage Synthesis Failure:", error);
    return NextResponse.json({ error: "Portal node failure" }, { status: 500 });
  }
}
