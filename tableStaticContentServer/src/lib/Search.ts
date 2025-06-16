import { z } from "zod";
import axios from "axios";
import { onSearchTabledContentRequestType } from "../typeConstant";
import Broadcaster from "./Broadcaster";
import elasticSearch from "../../../elasticSearchServer/src/index";
import { sanitizationUtils } from "src";
import { StaticContentTypesArray } from "../../../universal/contentTypeConstant";
// import qdrant from "../../../qdrantServer/src/index";

class Search {
  private indexMap: Record<string, string> = {
    application: "tableapplications",
    image: "tableimages",
    soundClip: "tablesoundclips",
    svg: "tablesvgs",
    text: "tabletext",
    video: "tablevideos",
  };
  private idMap: Record<string, string> = {
    tableapplications: "aid",
    tableimages: "iid",
    tablesoundclips: "sid",
    tablesvgs: "sid",
    tabletext: "xid",
    tablevideos: "vid",
  };

  constructor(private broadcaster: Broadcaster) {}

  private searchTabledContentRequestSchema = z.object({
    type: z.literal("searchTabledContentRequest"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentType: z.enum(StaticContentTypesArray).or(z.literal("all")),
    }),
    data: z.object({
      name: z.string(),
    }),
  });

  onSearchTabledContentRequest = async (
    event: onSearchTabledContentRequestType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSearchTabledContentRequestType;
    const validation =
      this.searchTabledContentRequestSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, contentType } = safeEvent.header;
    const { name } = safeEvent.data;

    let indices: string;
    if (contentType === "all") {
      indices = Object.values(this.indexMap).join(",");
    } else {
      indices = this.indexMap[contentType]!;
    }

    const boolQuery = {
      bool: {
        filter: [{ term: { tid: tableId } }],
        must: [
          {
            wildcard: {
              n: {
                value: `*${name.toLowerCase()}*`,
              },
            },
          },
        ],
      },
    };

    const hits = await elasticSearch.search(indices, boolQuery);
    const transformed = hits.flatMap((hit) => {
      const source = hit._source as Record<string, unknown>;

      if (source && Array.isArray(source["s"]) && source["s"].includes(0)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filteredSource: Record<string, any> = {};
        filteredSource[this.idMap[hit._index]] = hit._id;

        return {
          score: hit._score,
          source: filteredSource,
        };
      }

      return [];
    });

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "searchTabledContentResponded",
      data: transformed,
    });
  };

  // onSearchTabledContentRequest = async (
  //   event: onSearchTabledContentRequestType
  // ) => {
  //   const safeEvent = utils.sanitizeObject(
  //     event
  //   ) as onSearchTabledContentRequestType;
  //   const validation =
  //   this.searchTabledContentRequestSchema.safeParse(safeEvent);
  //
  //   if (!validation.success) {console.log("Warning, ", event.type, " failed to validate event"); return};
  //   const { tableId, username, instance, contentType } = safeEvent.header;
  //   const { name } = safeEvent.data;

  //   const embeddedVector = await this.embed(name);

  //   let collectionNames: string[];
  //   if (contentType === "all") {
  //     collectionNames = Object.values(this.indexMap);
  //   } else {
  //     collectionNames = [this.indexMap[contentType]!];
  //   }

  //   const results = (
  //     await Promise.all(
  //       collectionNames.map(async (collection) => {
  //         try {
  //           const result = await qdrant.search(collection, {
  //             vector: {
  //               name: "nVec",
  //               vector: embeddedVector,
  //             },
  //             filter: {
  //               must: [
  //                 {
  //                   key: "tid",
  //                   match: {
  //                     value: tableId,
  //                   },
  //                 },
  //               ],
  //             },
  //             limit: 1000,
  //           });

  //           return result.map((res) => ({ ...res, collection }));
  //         } catch (_) {
  //           return [];
  //         }
  //       })
  //     )
  //   ).flat();

  //   this.broadcaster.broadcastToInstance(tableId, username, instance, {
  //     type: "searchTabledContentResponded",
  //     data: this.filterByThreshold(results).flatMap((hit) => {
  //       const payload = hit.payload;

  //       if (
  //         payload &&
  //         Array.isArray(payload["s"]) &&
  //         payload["s"].includes(0)
  //       ) {
  //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //         const filteredSource: Record<string, any> = {};
  //         filteredSource[this.idMap[hit.collection]] = hit.id;

  //         return {
  //           score: hit.score,
  //           source: filteredSource,
  //         };
  //       }

  //       return [];
  //     }),
  //   });
  // };

  private filterByThreshold = (
    hits: {
      collection: string;
      id: string | number;
      version?: number;
      score?: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload?: any;
      vector?: number[];
    }[],
    fraction: number = 0.4
  ) => {
    if (hits.length === 0) return [];
    const sorted = [...hits].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const top = sorted[0].score ?? 0;
    return sorted.filter((h) => (h.score ?? 0) >= top * fraction);
  };

  private embed = async (text: string): Promise<number[]> => {
    const response = await axios.post("http://localhost:7400/embed", {
      input: [text],
    });

    const vector = response.data.data[0]?.embedding;
    if (!vector || !Array.isArray(vector)) {
      throw new Error("Invalid embedding response");
    }

    return vector;
  };
}

export default Search;
