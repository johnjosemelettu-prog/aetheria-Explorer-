import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for providing negotiation strategies in local markets.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const HagglingCoachInputSchema = z.object({
  item: z.string().describe("The item the user wants to buy."),
  initialPrice: z.number().describe("The price quoted by the vendor."),
  currency: z.string().describe("The currency code."),
  location: z.string().describe("The market or city location."),
  language: z.string().optional().describe("Output language."),
});
export type HagglingCoachInput = z.infer<typeof HagglingCoachInputSchema>;

const HagglingCoachOutputSchema = z.object({
  targetPrice: z.number().describe("The realistic price the user should aim for."),
  walkAwayPrice: z.number().describe("The price at which the user should leave."),
  strategy: z.string().describe("The overall negotiation approach (e.g., 'Friendly but Firm')."),
  tactics: z.array(z.string()).describe("Specific steps or actions to take during the deal."),
  localPhrases: z.array(z.object({
    phrase: z.string(),
    meaning: z.string(),
    pronunciation: z.string(),
  })).describe("Useful negotiation phrases in the local language."),
  culturalNote: z.string().describe("Local etiquette regarding haggling (e.g., 'Tipping is expected even after a deal')."),
});
export type HagglingCoachOutput = z.infer<typeof HagglingCoachOutputSchema>;

/**
 * Gets haggling strategy. Environment-aware logic for static export.
 */
export async function getHagglingStrategy(input: HagglingCoachInput): Promise<HagglingCoachOutput> {
  if (typeof window !== 'undefined') {
    return {
      targetPrice: Math.round(input.initialPrice * 0.6),
      walkAwayPrice: Math.round(input.initialPrice * 0.8),
      strategy: "The Polished Hesitation",
      tactics: ["Initialize with a friendly greeting node", "Point out a minor 'character flaw' in the asset", "Suggest a bundle acquisition"],
      localPhrases: [{ phrase: "Ikura desu ka?", meaning: "How much is this node?", pronunciation: "Ee-koo-rah dess-kah" }],
      culturalNote: "In this market node, silence is a powerful negotiation tool."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the "Backpacker Haggling Coach." Item: ${input.item}, Location: ${input.location}. Language: ${input.language || 'English'}.`,
      output: { schema: HagglingCoachOutputSchema },
    });

    if (!response.output) throw new Error('Failed to generate haggling strategy.');
    return response.output;
  } catch (error) {
    console.error("Haggling coach node error:", error);
    throw error;
  }
}
