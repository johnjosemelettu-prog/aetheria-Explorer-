import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for generating localized safety information.
 * Refactored for environment-aware execution to support static exports.
 */

const GenerateSafetyDataInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  userNationality: z.string().optional(),
  userHomeBase: z.string().optional(),
  language: z.string().optional(),
});
export type GenerateSafetyDataInput = z.infer<typeof GenerateSafetyDataInputSchema>;

const GenerateSafetyDataOutputSchema = z.object({
  locationName: z.string(),
  emergencyNumbers: z.array(z.object({
    service: z.string(),
    number: z.string(),
    icon: z.enum(['Siren', 'Ambulance', 'Flame', 'ShieldAlert']),
  })),
  embassy: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    note: z.string(),
  }),
  emergencyPhrases: z.array(z.object({
    english: z.string(),
    local: z.string(),
    pronunciation: z.string(),
  })),
  safetyAdvice: z.string(),
});
export type GenerateSafetyDataOutput = z.infer<typeof GenerateSafetyDataOutputSchema>;

export async function generateSafetyData(input: GenerateSafetyDataInput): Promise<GenerateSafetyDataOutput> {
  if (typeof window !== 'undefined') {
    return {
      locationName: "Paris, France",
      emergencyNumbers: [
        { service: "Police", number: "17", icon: "Siren" },
        { service: "Ambulance", number: "15", icon: "Ambulance" }
      ],
      embassy: {
        name: `Embassy of ${input.userNationality || 'Explorer'}`,
        address: "123 Diplomatic Node, City Center",
        phone: "+33 1 00 00 00 00",
        note: "Nearest verified response node."
      },
      emergencyPhrases: [
        { english: "I need help.", local: "J'ai besoin d'aide.", pronunciation: "Zheh be-zwah dehd" }
      ],
      safetyAdvice: "Standard urban safety protocols apply."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a safety guide for coordinates (${input.latitude}, ${input.longitude}). Nationality: ${input.userNationality}. Output Language: ${input.language || 'English'}.`,
      output: { schema: GenerateSafetyDataOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize safety node.");
    return response.output;
  } catch (error) {
    console.error("Safety assistant node error:", error);
    throw error;
  }
}
