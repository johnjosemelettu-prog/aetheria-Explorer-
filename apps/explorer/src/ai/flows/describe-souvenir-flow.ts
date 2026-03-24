import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for identifying a souvenir and explaining its cultural significance.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const DescribeSouvenirInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of an object as a data URI."),
  language: z.string().optional().describe("The output language."),
});
export type DescribeSouvenirInput = z.infer<typeof DescribeSouvenirInputSchema>;

const DescribeSouvenirOutputSchema = z.object({
  itemName: z.string().describe("The name of the item identified."),
  origin: z.string().describe("The cultural or geographical origin of the item."),
  significance: z.string().describe("The historical or cultural importance of this object."),
  story: z.string().describe("An evocative story or legend related to this type of item."),
  tips: z.string().describe("Advice on how to care for or verify the authenticity of the item."),
});
export type DescribeSouvenirOutput = z.infer<typeof DescribeSouvenirOutputSchema>;

/**
 * Describes a souvenir. Environment-aware logic for static export.
 */
export async function describeSouvenir(input: DescribeSouvenirInput): Promise<DescribeSouvenirOutput> {
  if (typeof window !== 'undefined') {
    return {
      itemName: "Traditional Lacquerware Box",
      origin: "Kanazawa, Japan",
      significance: "Represents centuries of precision craftsmanship and natural material synthesis.",
      story: "Legend says these boxes were used to store the memories of passing seasons.",
      tips: "Verify authenticity by the weight and the depth of the gold-leaf node."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `Identify the souvenir. Output in ${input.language || 'English'}.` }
      ],
      output: { schema: DescribeSouvenirOutputSchema },
    });

    if (!response.output) throw new Error('Failed to analyze the souvenir.');
    return response.output;
  } catch (error) {
    console.error("Souvenir storyteller node error:", error);
    throw error;
  }
}
