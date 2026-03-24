import { 
  SearchInsuranceInputSchema, 
  SearchInsuranceOutputSchema, 
  type SearchInsuranceInput, 
  type SearchInsuranceOutput,
  type InsurancePlan 
} from './insurance-schemas';

/**
 * @fileOverview A Genkit flow for synthesizing personalized travel insurance plans.
 * Refactored for environment-aware execution to support static exports.
 */

export type { InsurancePlan };

function getInsuranceFallbackPlans(input: SearchInsuranceInput): SearchInsuranceOutput {
  return {
    availablePlans: [
      {
        id: 'fallback-basic',
        name: 'Basic Guard',
        provider: 'Aura Underwriting',
        price: 25,
        coverageLimit: 50000,
        benefits: ['Emergency Medical', 'Theft Protection', '24/7 Support'],
        description: `Essential coverage node for your trip to ${input.destination}. Optimized for the minimalist explorer.`
      },
      {
        id: 'fallback-standard',
        name: 'Standard Shield',
        provider: 'Sentinel Global',
        price: 55,
        coverageLimit: 250000,
        benefits: ['Medical & Dental', 'Trip Cancellation', 'Lost Baggage'],
        description: `Balanced protection node synthesized for your stay in ${input.destination}. Covers major transit interruptions.`
      }
    ],
    recommendation: `Based on your trajectory to ${input.destination}, we recommend the Standard Shield node for balanced risk mitigation.`
  };
}

export async function searchInsurance(input: SearchInsuranceInput): Promise<SearchInsuranceOutput> {
  if (typeof window !== 'undefined') {
    return getInsuranceFallbackPlans(input);
  }

  try {
    const { ai } = await import('@/ai/genkit');
    
    const response = await ai.generate({
      prompt: `Synthesize travel insurance plans for ${input.destination}. Age: ${input.travelerAge}.`,
      output: { schema: SearchInsuranceOutputSchema },
    });

    return response.output || getInsuranceFallbackPlans(input);
  } catch (error) {
    console.error("Insurance search node error:", error);
    return getInsuranceFallbackPlans(input);
  }
}
