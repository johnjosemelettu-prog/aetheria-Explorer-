import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing destination-specific survival phrases.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const LanguageLabInputSchema = z.object({
  city: z.string().describe("The destination city."),
  targetLanguage: z.string().describe("The language spoken there."),
  userLanguage: z.string().optional().describe("The user's native language."),
});
export type LanguageLabInput = z.infer<typeof LanguageLabInputSchema>;

const PhraseSchema = z.object({
  phrase: z.string(),
  translation: z.string(),
  pronunciation: z.string(),
  category: z.enum(['Emergency', 'Social', 'Dining', 'Transit', 'Shopping']),
  culturalNote: z.string().describe("Context on when/how to use this phrase."),
});

const LanguageLabOutputSchema = z.object({
  survivalKit: z.array(PhraseSchema),
  localSlang: z.array(z.object({
    word: z.string(),
    meaning: z.string(),
    vibe: z.string(),
  })).describe("3-4 trendy local words to sound like a resident."),
});
export type LanguageLabOutput = z.infer<typeof LanguageLabOutputSchema>;

/**
 * Generates survival kit. Environment-aware logic for static export.
 */
export async function generateSurvivalKit(input: LanguageLabInput): Promise<LanguageLabOutput> {
  if (typeof window !== 'undefined') {
    return {
      survivalKit: [{ phrase: "Konnichiwa", translation: "Hello", pronunciation: "Kon-nee-chee-wah", category: "Social", culturalNote: "Standard greeting node." }],
      localSlang: [{ word: "Yabai", meaning: "Amazing / Terrible", vibe: "High intensity" }]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `Synthesize a survival language kit for ${input.city}. Language: ${input.targetLanguage}.`,
      output: { schema: LanguageLabOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize language kit.");
    return response.output;
  } catch (error) {
    console.error("Language lab node error:", error);
    throw error;
  }
}
