import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for wardrobe logistics emails.
 * Refactored for environment-aware execution to support static exports.
 */

const WardrobeEmailInputSchema = z.object({
  userName: z.string(),
  type: z.enum(['rental', 'purchase', 'return']),
  itemNames: z.array(z.string()),
  amount: z.number().optional(),
  language: z.string().optional(),
});
export type WardrobeEmailInput = z.infer<typeof WardrobeEmailInputSchema>;

const WardrobeEmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type WardrobeEmailOutput = z.infer<typeof WardrobeEmailOutputSchema>;

export async function synthesizeWardrobeEmail(input: WardrobeEmailInput): Promise<WardrobeEmailOutput> {
  if (typeof window !== 'undefined') {
    return { subject: `Wardrobe ${input.type}`, body: "Logistics confirmed." };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize wardrobe logistics email for ${input.userName}. Type: ${input.type}.`,
      output: { schema: WardrobeEmailOutputSchema },
    });

    if (!response.output) throw new Error("Wardrobe dispatcher node failure.");
    return response.output;
  } catch (error) {
    console.error("Wardrobe email node error:", error);
    return { subject: "Wardrobe Update", body: "Your items are being processed." };
  }
}
