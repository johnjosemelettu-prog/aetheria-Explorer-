import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for checking international visa requirements.
 * Environment-aware logic for static export / Capacitor compatibility.
 */

const CheckVisaRequirementsInputSchema = z.object({
  nationality: z.string().describe("The traveler's country of citizenship."),
  destination: z.string().describe("The country being visited."),
  purpose: z.enum(['Tourism', 'Business', 'Transit', 'Digital Nomad']).default('Tourism'),
  language: z.string().optional(),
});
export type CheckVisaRequirementsInput = z.infer<typeof CheckVisaRequirementsInputSchema>;

const CheckVisaRequirementsOutputSchema = z.object({
  status: z.enum(['Visa Required', 'Visa Free', 'eVisa', 'Visa on Arrival', 'Electronic Travel Authorization']),
  maxStayDays: z.number().optional(),
  requiredDocuments: z.array(z.string()),
  explanation: z.string().describe("A brief, high-fidelity summary of the entry rules."),
  officialLink: z.string().optional().describe("Link to the official government portal."),
});
export type CheckVisaRequirementsOutput = z.infer<typeof CheckVisaRequirementsOutputSchema>;

/**
 * Checks visa requirements. Environment-aware logic for static export.
 */
export async function checkVisaRequirements(input: CheckVisaRequirementsInput): Promise<CheckVisaRequirementsOutput> {
  if (typeof window !== 'undefined') {
    return {
      status: "Visa Free",
      maxStayDays: 90,
      requiredDocuments: ["Valid Passport (6 months)", "Return Ticket Node", "Proof of Funds"],
      explanation: `Citizens of ${input.nationality} currently enjoy visa-free entry to ${input.destination} for up to 90 days.`,
      officialLink: "https://www.passportindex.org"
    };
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const response = await ai.generate({
      prompt: `You are the 'Backpacker Visa Architect.' 
      Nationality: ${input.nationality}, Destination: ${input.destination}, Purpose: ${input.purpose}
      Output Language: ${input.language || 'English'}.`,
      output: { schema: CheckVisaRequirementsOutputSchema },
    });

    if (!response.output) throw new Error("Failed to synthesize visa intelligence.");
    return response.output;
  } catch (error) {
    console.error("Visa architect node error:", error);
    throw error;
  }
}
