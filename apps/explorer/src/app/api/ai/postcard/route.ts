
import { NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

/**
 * @fileOverview Server-side Art Synthesis Node.
 * Handles Imagen 4 postcard generation tasks.
 */

process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;

const ai = genkit({
  plugins: [googleAI()],
});

const PostcardInputSchema = z.object({
  photoDataUri: z.string(),
  style: z.string(),
  message: z.string().optional(),
  language: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = PostcardInputSchema.parse(body);

    // 1. Analyze the photo context
    const analysisResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Analyze this travel photo. Identify key landmarks and the overall mood." }
      ],
    });

    const context = analysisResponse.text;

    // 2. Generate the artistic prompt
    const stylePromptMap: Record<string, string> = {
      'Vintage': 'a 1950s style vintage travel postcard',
      'Oil Painting': 'an impressionist oil painting',
      'Watercolor': 'a delicate watercolor painting',
      'Cyberpunk': 'a futuristic cyberpunk reimagining',
      'Cinematic': 'a cinematic movie still',
      'Sketch': 'a detailed hand-drawn architectural sketch'
    };

    const imagePrompt = `An artistic travel postcard. Style: ${stylePromptMap[input.style] || 'artistic'}. Subject: ${context}. Message vibe: ${input.message || 'Greetings'}. High quality art, 16:9 aspect ratio.`;

    // 3. Synthesize the image via Imagen 4
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
    });

    if (!media || !media.url) throw new Error('Art synthesis node returned no data.');

    // 4. Generate a poetic caption
    const captionResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Write a single, poetic sentence in ${input.language || 'English'} about a ${input.style} version of this location based on this context: ${context}`,
    });

    return NextResponse.json({
      postcardImageUrl: media.url,
      description: captionResponse.text,
    });
  } catch (error: any) {
    console.error("Art Synthesis Failure:", error);
    return NextResponse.json({ error: "Studio node failure" }, { status: 500 });
  }
}
