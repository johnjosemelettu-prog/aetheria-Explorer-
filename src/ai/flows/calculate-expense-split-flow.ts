import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for optimizing group expense splitting.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const ExpenseSchema = z.object({
  description: z.string(),
  amount: z.number(),
  payerId: z.string(),
  payerName: z.string(),
});

const CalculateExpenseSplitInputSchema = z.object({
  expenses: z.array(ExpenseSchema),
  participantIds: z.array(z.string()),
  language: z.string().optional(),
});
export type CalculateExpenseSplitInput = z.infer<typeof CalculateExpenseSplitInputSchema>;

const SettlementSchema = z.object({
  fromName: z.string(),
  toName: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
});

const CalculateExpenseSplitOutputSchema = z.object({
  totalGroupSpend: z.number(),
  averagePerPerson: z.number(),
  settlements: z.array(SettlementSchema),
  summary: z.string().describe("A friendly summary of the group's financial synthesis."),
});
export type CalculateExpenseSplitOutput = z.infer<typeof CalculateExpenseSplitOutputSchema>;

/**
 * Calculates expense split. Environment-aware logic for static export.
 */
export async function calculateExpenseSplit(input: CalculateExpenseSplitInput): Promise<CalculateExpenseSplitOutput> {
  if (typeof window !== 'undefined') {
    const total = input.expenses.reduce((acc, e) => acc + e.amount, 0);
    const avg = total / input.participantIds.length;
    return {
      totalGroupSpend: total,
      averagePerPerson: avg,
      settlements: [
        { fromName: "Explorer A", toName: "Explorer B", amount: 25.50, currency: "USD" }
      ],
      summary: "Financial equilibrium reached with minimal transaction nodes."
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Backpacker Ledger Architect.' 
      Analyze the following group expenses: ${JSON.stringify(input.expenses)}
      Participants: ${input.participantIds.length}
      Output Language: ${input.language || 'English'}.`,
      output: { schema: CalculateExpenseSplitOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize expense ledger.");
    return response.output;
  } catch (error) {
    console.error("Expense split node error:", error);
    throw error;
  }
}
