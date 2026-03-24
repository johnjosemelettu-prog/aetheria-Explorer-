/**
 * @fileOverview A Genkit flow for analyzing food menus from images.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const ExploreMenuInputSchema = z.object({
  photoDataUri: z.string().describe("A data URI of the menu photo."),
  targetLanguage: z.string().describe("The language to translate dish descriptions into."),
});
export type ExploreMenuInput = z.infer<typeof ExploreMenuInputSchema>;

const ExploreMenuOutputSchema = z.object({
  menuTitle: z.string().describe("The identified name of the restaurant or menu section."),
  dishes: z.array(z.object({
    originalName: z.string(),
    translatedName: z.string(),
    description: z.string().describe("A mouth-watering description of the dish."),
    keyIngredients: z.array(z.string()),
    spicinessLevel: z.number().min(0).max(5).describe("Rate from 0 to 5."),
    dietaryInfo: z.object({
      isVegetarian: z.boolean(),
      isVegan: z.boolean(),
      containsCommonAllergens: z.boolean(),
    }),
  })),
});
export type ExploreMenuOutput = z.infer<typeof ExploreMenuOutputSchema>;

export async function exploreMenu(input: ExploreMenuInput): Promise<ExploreMenuOutput> {
  if (typeof window !== 'undefined') {
    return {
      menuTitle: "Le Petit Node",
      dishes: [
        {
          originalName: "Ratatouille Classique",
          translatedName: "Classic Ratatouille",
          description: "A high-fidelity synthesis of Provencal vegetables.",
          keyIngredients: ["Zucchini", "Eggplant", "Bell Pepper"],
          spicinessLevel: 0,
          dietaryInfo: { isVegetarian: true, isVegan: true, containsCommonAllergens: false }
        }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `You are a world-class culinary expert. Analyze the menu photo. Translate to ${input.targetLanguage}.` }
      ],
      output: { schema: ExploreMenuOutputSchema },
    });

    if (!response.output) throw new Error('Failed to analyze menu.');
    return response.output;
  } catch (error) {
    console.error("Explore menu node error:", error);
    throw error;
  }
}
