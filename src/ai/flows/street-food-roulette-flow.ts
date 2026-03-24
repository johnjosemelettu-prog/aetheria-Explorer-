import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for the Street Food Roulette.
 * Refactored for environment-aware execution to support static exports.
 */

const StreetFoodRouletteInputSchema = z.object({
  city: z.string(),
  language: z.string().optional(),
});
export type StreetFoodRouletteInput = z.infer<typeof StreetFoodRouletteInputSchema>;

const FoodItemSchema = z.object({
    name: z.string(),
    description: z.string(),
    theDare: z.string(),
    proTip: z.string(),
});

const StreetFoodRouletteOutputSchema = z.object({
  foods: z.array(FoodItemSchema),
});
export type StreetFoodRouletteOutput = z.infer<typeof StreetFoodRouletteOutputSchema>;

export async function getStreetFoodRoulette(input: StreetFoodRouletteInput): Promise<StreetFoodRouletteOutput> {
  if (typeof window !== 'undefined') {
    return {
      foods: [
        { name: "Night Market Skewer", description: "Spicy and charred.", theDare: "Eat without water.", proTip: "Ask for the red sauce." }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Find 5 street foods in ${input.city}.`,
      output: { schema: StreetFoodRouletteOutputSchema },
    });

    if (!response.output) throw new Error("Flavor scout node error.");
    return response.output;
  } catch (error) {
    console.error("Street food roulette node error:", error);
    throw error;
  }
}
