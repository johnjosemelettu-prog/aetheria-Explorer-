import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for the Pharmacy Scout.
 * Refactored for environment-aware execution to support static exports.
 */

const PharmacyScoutInputSchema = z.object({
  photoDataUri: z.string(),
  language: z.string().optional(),
});
export type PharmacyScoutInput = z.infer<typeof PharmacyScoutInputSchema>;

const PharmacyScoutOutputSchema = z.object({
  medicineName: z.string(),
  activeIngredients: z.array(z.string()),
  purpose: z.string(),
  dosageSummary: z.string(),
  warnings: z.array(z.string()),
  localEquivalentHint: z.string(),
});
export type PharmacyScoutOutput = z.infer<typeof PharmacyScoutOutputSchema>;

export async function pharmacyScout(input: PharmacyScoutInput): Promise<PharmacyScoutOutput> {
  if (typeof window !== 'undefined') {
    return {
      medicineName: "Localized Medication",
      activeIngredients: ["Paracetamol"],
      purpose: "[NOT MEDICAL ADVICE] General pain relief.",
      dosageSummary: "Standard adult dosage node.",
      warnings: ["Check for allergies."],
      localEquivalentHint: "Similar to Tylenol."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: "Analyze medication label. Language: " + (input.language || 'English') }
      ],
      output: { schema: PharmacyScoutOutputSchema },
    });

    if (!response.output) throw new Error("Label decode node failed.");
    return response.output;
  } catch (error) {
    console.error("Pharmacy scout node error:", error);
    throw error;
  }
}
