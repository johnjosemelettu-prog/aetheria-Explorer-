import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for providing AI-driven financial optimization for trips.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const BudgetAdviceInputSchema = z.object({
  totalBudget: z.number(),
  currentSpend: z.number(),
  remainingDays: z.number(),
  itinerarySummary: z.string(),
  recentTransactions: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string(),
  })),
  language: z.string().optional(),
});
export type BudgetAdviceInput = z.infer<typeof BudgetAdviceInputSchema>;

const BudgetAdviceOutputSchema = z.object({
  status: z.enum(['under_budget', 'on_track', 'over_budget']),
  dailyAllowanceRemaining: z.number(),
  optimizationStrategy: z.string().describe("A high-level strategy to reach molecular financial equilibrium."),
  smartSwaps: z.array(z.object({
    originalPlan: z.string(),
    suggestedSwap: z.string(),
    reasoning: z.string(),
    estimatedSaving: z.number(),
  })).describe("3 specific activity or dining swaps to save money."),
});
export type BudgetAdviceOutput = z.infer<typeof BudgetAdviceOutputSchema>;

/**
 * Generates budget advice. Environment-aware logic for static export.
 */
export async function generateBudgetAdvice(input: BudgetAdviceInput): Promise<BudgetAdviceOutput> {
  if (typeof window !== 'undefined') {
    return {
      status: "on_track",
      dailyAllowanceRemaining: (input.totalBudget - input.currentSpend) / input.remainingDays,
      optimizationStrategy: "Maintain current velocity. Prioritize local market nodes for dining.",
      smartSwaps: [
        { originalPlan: "Hotel Fine Dining", suggestedSwap: "Tsukiji Outer Market", reasoning: "Better vibe, 80% lower asset requirement.", estimatedSaving: 120 }
      ]
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Backpacker Financial Oracle.' Total Budget: $${input.totalBudget}, Current Spend: $${input.currentSpend}. Output Language: ${input.language || 'English'}.`,
      output: { schema: BudgetAdviceOutputSchema },
    });

    if (!response.output) throw new Error("Financial oracle synthesis failed.");
    return response.output;
  } catch (error) {
    console.error("Financial oracle node error:", error);
    throw error;
  }
}
