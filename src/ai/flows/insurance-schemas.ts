import { z } from 'zod';

/**
 * @fileOverview Universal schemas for the Travel Insurance feature.
 */

export const SearchInsuranceInputSchema = z.object({
  destination: z.string().min(2).describe('The primary travel destination.'),
  startDate: z.string().describe('Policy start date in YYYY-MM-DD.'),
  endDate: z.string().describe('Policy end date in YYYY-MM-DD.'),
  travelerAge: z.number().min(18).max(100).describe('Age of the primary traveler.'),
  tripValue: z.number().optional().describe('Estimated total cost of the trip for coverage calculation.'),
  language: z.string().optional().describe('Output language for descriptions.'),
});

export type SearchInsuranceInput = z.infer<typeof SearchInsuranceInputSchema>;

export const InsurancePlanSchema = z.object({
  id: z.string(),
  name: z.string().describe('Name of the plan (e.g., Basic Explorer, Elite Guard).'),
  provider: z.string().describe('The underwriting partner.'),
  price: z.number().describe('Total policy cost in USD.'),
  coverageLimit: z.number().describe('Maximum coverage amount.'),
  benefits: z.array(z.string()).describe('Key highlights of the coverage.'),
  description: z.string().describe('A brief, high-fidelity summary of why this plan fits the trip.'),
});

export type InsurancePlan = z.infer<typeof InsurancePlanSchema>;

export const SearchInsuranceOutputSchema = z.object({
  availablePlans: z.array(InsurancePlanSchema),
  recommendation: z.string().describe('AI recommendation based on destination risk and trip parameters.'),
});

export type SearchInsuranceOutput = z.infer<typeof SearchInsuranceOutputSchema>;
