
/**
 * @fileOverview A Genkit flow for synthesizing a trip soundtrack.
 * Refactored for environment-aware execution to support static exports.
 */

import { z } from 'zod';

const SoundtrackInputSchema = z.object({
  destination: z.string(),
  vibe: z.string(),
  language: z.string().optional(),
});
export type SoundtrackInput = z.infer<typeof SoundtrackInputSchema>;

const TrackSchema = z.object({
  title: z.string(),
  artist: z.string(),
  genre: z.string(),
  whyItFits: z.string(),
});

const SoundtrackOutputSchema = z.object({
  playlistTitle: z.string(),
  overallAura: z.string(),
  tracks: z.array(TrackSchema),
  suggestedBpm: z.number(),
});
export type SoundtrackOutput = z.infer<typeof SoundtrackOutputSchema>;

export async function generateTripSoundtrack(input: SoundtrackInput): Promise<SoundtrackOutput> {
  if (typeof window !== 'undefined') {
    return {
      playlistTitle: `${input.destination} Pulse`,
      overallAura: "A high-fidelity mix of local indie nodes and cinematic soundscapes.",
      tracks: [
        { title: "Neon Drift", artist: "Aura Resident 01", genre: "Electronic", whyItFits: "Matches the urban nocturnal vibe." }
      ],
      suggestedBpm: 120
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a 5-track soundtrack for ${input.destination}. Vibe: ${input.vibe}. Language: ${input.language || 'English'}.`,
      output: { schema: SoundtrackOutputSchema },
    });

    if (!response.output) throw new Error("Auditory synthesis node failed.");
    return response.output;
  } catch (error) {
    console.error("Soundtrack node error:", error);
    throw error;
  }
}
