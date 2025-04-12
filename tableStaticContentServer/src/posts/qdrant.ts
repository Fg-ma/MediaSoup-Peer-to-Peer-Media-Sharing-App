import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });

export async function uploadEmbeddingToQdrant(
  embedding: number[],
  contentId: string,
  collectionName: string = "tableSvgs"
) {
  const point = {
    id: contentId, // string or number (you can also auto-generate IDs)
    vector: embedding,
    payload: {
      contentId,
    },
  };

  // Upsert (insert or update) the point into the existing collection
  const response = await qdrant.upsert(collectionName, {
    wait: true,
    points: [point],
  });

  return response;
}
