import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating a stylish AI invite card.
 * Refactored for environment-aware execution to support static exports.
 */

const GenerateInviteCardInputSchema = z.object({
  eventName: z.string().describe("The name of the event."),
  location: z.string().describe("The event location."),
  vibe: z.string().describe("The desired aesthetic."),
  language: z.string().optional().describe("Output language."),
});
export type GenerateInviteCardInput = z.infer<typeof GenerateInviteCardInputSchema>;

const GenerateInviteCardOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated invite card image."),
  description: z.string().describe("A short, evocative description."),
});
export type GenerateInviteCardOutput = z.infer<typeof GenerateInviteCardOutputSchema>;

export async function generateInviteCard(input: GenerateInviteCardInput): Promise<GenerateInviteCardOutput> {
  if (typeof window !== 'undefined') {
    return {
      imageUrl: "https://picsum.photos/seed/invite/800/450",
      description: `A minimalist travel invitation card for "${input.eventName}" in ${input.location}.`,
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const promptResponse = await ai.generate({
      prompt: `Design a travel invitation card for ${input.eventName} in ${input.location}. Vibe: ${input.vibe}.`,
    });

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: promptResponse.text,
    });

    return {
      imageUrl: media?.url || "https://picsum.photos/seed/invite/800/450",
      description: `High-fidelity invitation synthesized for ${input.eventName}.`,
    };
  } catch (error) {
    console.error("Invite synthesis node error:", error);
    throw error;
  }
}
