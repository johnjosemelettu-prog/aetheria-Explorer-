import { z } from 'zod';

/**
 * @fileOverview A Genkit flow for synthesizing personalized travel insurance plans.
 */

const InsurancePlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  price: z.number(),
  coverageLimit: z.number(),
  benefits: z.array(z.string()),
  description: z.string(),
});
export type InsurancePlan = z.infer<typeof InsurancePlanSchema>;

export async function searchInsurance(input: any): Promise<{ availablePlans: InsurancePlan[], recommendation: string }> {
  return {
    availablePlans: [
      {
        id: 'plan-1',
        name: 'Sentinel Guard',
        provider: 'Aura Underwriting',
        price: 55,
        coverageLimit: 250000,
        benefits: ['Medical', 'Trip Cancellation', 'Lost Baggage'],
        description: 'Balanced protection node.'
      }
    ],
    recommendation: 'Standard Shield node recommended for balanced risk mitigation.'
  };
}
