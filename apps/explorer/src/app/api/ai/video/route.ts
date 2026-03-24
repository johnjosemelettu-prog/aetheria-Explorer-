
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

/**
 * @fileOverview Server-side Video Synthesis Node.
 * Handles heavy Veo 3 / Veo 2 generation tasks.
 */

process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;

const ai = genkit({
  plugins: [googleAI()],
});

const GenerateTripVideoInputSchema = z.object({
  destination: z.string(),
  vibe: z.string(),
  highlights: z.array(z.string()),
  format: z.enum(['horizontal', 'vertical']).default('horizontal'),
  language: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = GenerateTripVideoInputSchema.parse(body);

    const promptResponse = await ai.generate({
      prompt: `Create a cinematic travel video prompt for ${input.destination}. Vibe: ${input.vibe}. Highlights: ${input.highlights.join(', ')}`,
    });

    const videoPrompt = promptResponse.text;

    let { operation } = await ai.generate({
      model: input.format === 'vertical' ? googleAI.model('veo-2.0-generate-001') : googleAI.model('veo-3.0-generate-preview'),
      prompt: videoPrompt,
      config: {
        aspectRatio: input.format === 'vertical' ? '9:16' : '16:9',
      }
    });

    if (!operation) throw new Error('Model failed to return an operation node.');

    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      if (!operation.done) await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) throw new Error('Video synthesis failed: ' + operation.error.message);

    const videoPart = operation.output?.message?.content.find((p: any) => !!p.media);
    if (!videoPart || !videoPart.media?.url) throw new Error('Video node not found in result.');

    const videoResponse = await fetch(videoPart.media.url, {
      method: 'GET',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || '',
      },
    });
    const buffer = await videoResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({
      videoDataUri: `data:video/mp4;base64,${base64}`,
      prompt: videoPrompt,
    });
  } catch (error: any) {
    console.error("Video Synthesis Failure:", error);
    return NextResponse.json({ error: "Cinema node failure" }, { status: 500 });
  }
}
