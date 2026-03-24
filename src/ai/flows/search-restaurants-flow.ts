import { z } from 'zod';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * @fileOverview A Genkit flow for searching for restaurants.
 * Refactored for environment-aware execution to support static exports.
 */

const SearchRestaurantsInputSchema = z.object({
  location: z.string(),
  cuisine: z.string().optional(),
  date: z.string(),
  time: z.string(),
  guests: z.number(),
  language: z.string().optional(),
});
export type SearchRestaurantsInput = z.infer<typeof SearchRestaurantsInputSchema>;

const RestaurantSchema = z.object({
    id: z.string(),
    name: z.string(),
    cuisine: z.string(),
    rating: z.number(),
    image: z.object({
        id: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        imageHint: z.string(),
    }).optional(),
});
export type Restaurant = z.infer<typeof RestaurantSchema>;

const SearchRestaurantsOutputSchema = z.array(RestaurantSchema);
export type SearchRestaurantsOutput = z.infer<typeof SearchRestaurantsOutputSchema>;

function getMockRestaurants(): Restaurant[] {
  return [
    {
        id: 'restaurant-1',
        name: 'The Golden Spoon',
        cuisine: 'Fine Dining',
        rating: 4.9,
        image: PlaceHolderImages.find((img) => img.id === 'restaurant-1'),
    },
    {
        id: 'restaurant-2',
        name: 'The Daily Grind Cafe',
        cuisine: 'Cafe',
        rating: 4.6,
        image: PlaceHolderImages.find((img) => img.id === 'restaurant-2'),
    }
  ];
}

export async function searchRestaurants(input: SearchRestaurantsInput): Promise<SearchRestaurantsOutput> {
  if (typeof window !== 'undefined') {
    return getMockRestaurants();
  }

  try {
    const { ai } = await import('@/ai/genkit');
    const restaurants = getMockRestaurants();

    if (input.language && input.language.toLowerCase() !== 'english') {
      const response = await ai.generate({
        prompt: `Translate these restaurant options into ${input.language}: ${JSON.stringify(restaurants)}`,
        output: { schema: SearchRestaurantsOutputSchema },
      });
      return response.output || restaurants;
    }

    return restaurants;
  } catch (error) {
    console.error("Restaurant search node error:", error);
    return getMockRestaurants();
  }
}
