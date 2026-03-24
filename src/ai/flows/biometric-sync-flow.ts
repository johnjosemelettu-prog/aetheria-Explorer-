/**
 * @fileOverview A Genkit flow for adjusting itineraries based on simulated biometric data.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

import { z } from 'zod';

const BiometricSyncInputSchema = z.object({
  stressLevel: z.number().min(1).max(10).describe("Current cortisol node (1-10)."),
  sleepHours: z.number().describe("Hours of sleep last night."),
  currentActivity: z.string().describe("The scheduled activity for the current hour."),
  itinerarySummary: z.string(),
  language: z.string().optional(),
});
export type BiometricSyncInput = z.infer<typeof BiometricSyncInputSchema>;

const BiometricSyncOutputSchema = z.object({
  equilibriumStatus: z.enum(['Optimal', 'Slight Drift', 'Biological Crisis']),
  adjustmentRequired: z.boolean(),
  suggestedAction: z.string().describe("Immediate physical action (e.g., 'Hydrate and find shade')."),
  itineraryPivot: z.object({
    originalActivity: z.string(),
    newActivity: z.string(),
    reasoning: z.string().describe("Why this pivot restores biological equilibrium."),
  }).optional(),
});
export type BiometricSyncOutput = z.infer<typeof BiometricSyncOutputSchema>;

export async function syncBiometrics(input: BiometricSyncInput): Promise<BiometricSyncOutput> {
  if (typeof window !== 'undefined') {
    // Client-side/Capacitor environment: Return high-fidelity mock
    const isCrisis = input.stressLevel > 7 || input.sleepHours < 5;
    return {
      equilibriumStatus: isCrisis ? 'Biological Crisis' : 'Optimal',
      adjustmentRequired: isCrisis,
      suggestedAction: isCrisis ? "Increase hydration and seek low-stimulation node." : "Maintain current trajectory.",
      itineraryPivot: isCrisis ? {
        originalActivity: input.currentActivity,
        newActivity: "Quiet Garden Meditation",
        reasoning: "High cortisol detection requires immediate neural down-regulation."
      } : undefined
    };
  }

  // Server-side environment: Execute Genkit logic via dynamic import
  try {
    const { ai } = await import('@/ai/genkit');
    
    const response = await ai.generate({
      prompt: `You are the 'Aura Biological Optimizer.' 
      Analyze the explorer's current state:
      - Stress Node: ${input.stressLevel}/10
      - Recovery Window: ${input.sleepHours} hours sleep
      - Current Objective: ${input.currentActivity}
      
      Requirements:
      1. If stress > 7 or sleep < 5, adjustment is REQUIRED. 
      2. Pivot: Replace the current activity with something that lowers cortisol (e.g., swapping a hike for a meditation garden).
      3. Reasoning: Explain the biological logic.
      
      Output Language: ${input.language || 'English'}.`,
      output: { schema: BiometricSyncOutputSchema },
    });

    if (!response.output) throw new Error("Biological sync failed.");
    return response.output;
  } catch (error) {
    console.error("Biological sync failed:", error);
    return {
      equilibriumStatus: 'Optimal',
      adjustmentRequired: false,
      suggestedAction: "Maintain trajectory."
    };
  }
}
