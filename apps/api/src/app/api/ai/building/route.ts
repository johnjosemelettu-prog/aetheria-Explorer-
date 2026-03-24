
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

/**
 * @fileOverview Server-side Spatial Synthesis Node.
 * Identifies buildings and generates VR panoramas.
 */

const ai = genkit({
  plugins: [googleAI()],
});

const BuildingInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = BuildingInputSchema.parse(body);

    const { output } = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `Identify this building and describe its heritage. Then, generate a detailed prompt for a 360-degree equirectangular panorama of its interior. Output Language: ${input.language || 'English'}.` }
      ],
      output: { 
        schema: z.object({ 
          description: z.string(), 
          vrPrompt: z.string() 
        }) 
      },
    });

    if (!output) throw new Error('Spatial analysis node failure.');

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: output.vrPrompt,
    });

    return NextResponse.json({
      description: output.description,
      vrImageUrl: media?.url || "https://picsum.photos/seed/vr/1200/600",
    });
  } catch (error: any) {
    console.error("Spatial Synthesis Failure:", error);
    return NextResponse.json({ error: "Architecture node failure" }, { status: 500 });
  }
}
