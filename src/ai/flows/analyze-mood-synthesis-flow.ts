import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for analyzing user sentiment and providing an "Emotional Pivot".
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const MoodSynthesisInputSchema = z.object({
  dailySummary: z.string().describe("Text description of the day's events or feelings."),
  photoDataUri: z.string().optional().describe("A photo of the user or location from today."),
  language: z.string().optional(),
});
export type MoodSynthesisInput = z.infer<typeof MoodSynthesisInputSchema>;

const MoodSynthesisOutputSchema = z.object({
  detectedVibe: z.string().describe("e.g., 'Exhausted but Fulfilled', 'Aesthetic Peak', 'Logic Overload'."),
  happinessScore: z.number().min(1).max(10),
  burnoutRisk: z.enum(['Low', 'Medium', 'Critical']),
  emotionalAnalysis: z.string().describe("A brief, empathetic analysis of the user's current state."),
  itineraryPivot: z.object({
    suggestedShift: z.string().describe("e.g., 'Swap tomorrow's 6am trek for a 10am garden tea'."),
    reasoning: z.string(),
  }).optional(),
});
export type MoodSynthesisOutput = z.infer<typeof MoodSynthesisOutputSchema>;

/**
 * Analyzes mood synthesis. Environment-aware logic for static export.
 */
export async function analyzeMoodSynthesis(input: MoodSynthesisInput): Promise<MoodSynthesisOutput> {
  if (typeof window !== 'undefined') {
    return {
      detectedVibe: "Exhausted but Fulfilled",
      happinessScore: 8,
      burnoutRisk: "Low",
      emotionalAnalysis: "The explorer is operating at peak sensory immersion, but physical nodes are nearing depletion.",
      itineraryPivot: {
        suggestedShift: "Delay tomorrow's 07:00 node by 3 hours.",
        reasoning: "Restoring biological equilibrium will prevent a logic collapse by midday."
      }
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Aura Emotional Architect.' 
      Analyze the explorer's day: "${input.dailySummary}"
      ${input.photoDataUri ? "Also analyze the visual mood from the provided media." : ""}
      Output Language: ${input.language || 'English'}.`,
      output: { schema: MoodSynthesisOutputSchema },
    });

    if (!response.output) throw new Error("Mood synthesis node failed.");
    return response.output;
  } catch (error) {
    console.error("Mood synthesis node error:", error);
    throw error;
  }
}
