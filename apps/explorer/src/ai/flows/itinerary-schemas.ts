import { z } from 'zod';

/**
 * @fileOverview Universal schemas for travel itineraries.
 */

export const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The travel destination.'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date of the trip in YYYY-MM-DD format.'),
  interests: z
    .array(z.string())
    .describe('A list of user interests for the trip, e.g., "history", "food", "hiking".'),
  budget: z.enum(['low', 'medium', 'high']).describe('The user\'s budget for the trip (low, medium, or high).'),
  travelStyle: z
    .array(z.string())
    .describe('A list of user travel styles, e.g., "relaxed", "adventurous", "cultural".'),
  vibe: z.string().optional().describe("The user's current mood or desired psychological vibe for the trip."),
  language: z.string().optional().describe('The language for the output.'),
});
export type GeneratePersonalizedItineraryInput = z.infer<
  typeof GeneratePersonalizedItineraryInputSchema
>;

export const GeneratePersonalizedItineraryOutputSchema = z.object({
  itinerarySummary: z.string().describe('A brief overall summary of the generated itinerary.'),
  dailyPlans: z
    .array(
      z.object({
        date: z.string().describe('The date of the daily plan in YYYY-MM-DD format.'),
        theme: z.string().describe('A short theme or focus for the day.'),
        activities:
          z.array(
            z.object({
              time: z.string().describe('Suggested time for the activity.'),
              description: z.string().describe('Description of the activity.'),
            })
          ).describe('A detailed list of activities for the day.'),
        notes: z.string().optional().describe('Any additional notes or tips for the day.'),
      })
    )
    .describe('A list of daily itinerary plans.'),
});
export type GeneratePersonalizedItineraryOutput = z.infer<
  typeof GeneratePersonalizedItineraryOutputSchema
>;
