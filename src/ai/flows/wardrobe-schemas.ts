import { z } from 'zod';

/**
 * @fileOverview Universal schemas for the Digital Tailor wardrobe feature.
 */

const EventSchema = z.object({
    name: z.string(),
    dressCode: z.string(),
});

export const RecommendWardrobeInputSchema = z.object({
    fitPreference: z.string().describe("User's preferred clothing fit (e.g., 'Slim', 'Regular')."),
    sensitivities: z.array(z.string()).describe("User's material or style sensitivities."),
    styleVibe: z.object({
        lovedLooks: z.array(z.string()),
        passedLooks: z.array(z.string()),
    }).describe("User's reaction to different style inspirations."),
    brandAffinities: z.array(z.string()).describe("Brands the user likes."),
    tripContext: z.object({
        destination: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        predictedWeather: z.string().describe("A summary of the expected weather."),
        luggageLevel: z.string().describe("User's luggage preference ('Zero' or 'Hybrid')."),
        events: z.array(EventSchema).describe("Planned events with dress codes."),
    }),
    language: z.string().optional().describe("The language for the output."),
});
export type RecommendWardrobeInput = z.infer<typeof RecommendWardrobeInputSchema>;

export const RecommendedItemSchema = z.object({
    itemName: z.string().describe("Name of the clothing item."),
    category: z.string().describe("Category of the item (e.g., 'Outerwear', 'Top', 'Bottoms')."),
    description: z.string().describe("Why this item was chosen and how to style it."),
    imageHint: z.string().describe("Keywords for generating a representative image (e.g., 'blue trench coat')."),
});
export type RecommendedItem = z.infer<typeof RecommendedItemSchema>;


export const OutfitSchema = z.object({
    outfitName: z.string().describe("Name for the outfit (e.g., 'Museum Day', 'Gala Dinner')."),
    items: z.array(RecommendedItemSchema),
});
export type Outfit = z.infer<typeof OutfitSchema>;

export const RecommendWardrobeOutputSchema = z.object({
  packingList: z.array(OutfitSchema).describe("A list of complete outfits tailored for the trip."),
  summary: z.string().describe("A brief summary of the styling logic and wardrobe choices."),
});
export type RecommendWardrobeOutput = z.infer<typeof RecommendWardrobeOutputSchema>;

export const fallbackWardrobe: RecommendWardrobeOutput = {
  packingList: [
    {
      outfitName: 'City Explorer',
      items: [
        {
          itemName: 'Comfortable Chinos',
          category: 'Bottoms',
          description: 'Versatile and breathable trousers perfect for all-day walking and exploration.',
          imageHint: 'trousers',
        },
        {
          itemName: 'Linen Button-Down',
          category: 'Top',
          description: 'A crisp, lightweight shirt that keeps you cool while looking sharp.',
          imageHint: 'white shirt',
        },
      ],
    },
    {
      outfitName: 'Elegant Evening',
      items: [
        {
          itemName: 'Tailored Blazer',
          category: 'Outerwear',
          description: 'A well-fitted blazer that transitions perfectly from a museum visit to a fine dining experience.',
          imageHint: 'blazer',
        },
        {
          itemName: 'Classic Cocktail Dress',
          category: 'Dress',
          description: 'An elegant and timeless piece suitable for any formal evening occasion.',
          imageHint: 'cocktail dress',
        },
      ],
    },
  ],
  summary: 'We have curated a selection of timeless, versatile high-quality basics. These items were chosen for their exceptional comfort and ability to be easily mixed and matched, ensuring you look your best throughout your journey.',
};
