
/**
 * @fileOverview Bridge flow for Spatial Previews.
 * Communicates with the hosted Aetheria API node to identify buildings and synthesize VR assets.
 */

export type DescribeBuildingOutput = {
  description: string;
  vrImageUrl: string;
};

export async function describeBuilding(input: { photoDataUri: string, language: string }): Promise<DescribeBuildingOutput> {
  const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9003/api/ai';

  try {
    const response = await fetch(`${API_BASE}/building`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("API Node Offline");
    return await response.json();
  } catch (error) {
    console.warn("[AETHERIA BRIDGE] Architecture synthesis node unreachable. Returning high-fidelity mock.");
    return {
      description: "A breathtaking historical landmark synthesized from local architectural DNA. [OFFLINE MODE]",
      vrImageUrl: "https://picsum.photos/seed/vr/1200/600",
    };
  }
}
