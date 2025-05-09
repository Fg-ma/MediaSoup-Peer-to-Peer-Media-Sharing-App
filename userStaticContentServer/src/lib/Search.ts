import { onSearchUserContentRequestType } from "../typeConstant";
import Broadcaster from "./Broadcaster";
import elasticSearch from "../../../elasticSearchServer/src/index";

class Search {
  private indexMap: Record<string, string> = {
    application: "userapplications",
    image: "userimages",
    soundClip: "usersoundclips",
    svg: "usersvgs",
    text: "usertext",
    video: "uservideos",
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

  onSearchUserContentRequest = async (
    event: onSearchUserContentRequestType
  ) => {
    const { userId, instance, contentType } = event.header;
    const { name } = event.data;

    // build your list of indices
    let indices: string;
    if (contentType === "all") {
      indices = Object.values(this.indexMap).join(",");
    } else {
      indices = this.indexMap[contentType]!;
    }

    const boolQuery = {
      bool: {
        filter: [{ term: { uid: userId } }],
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
      const source = hit["_source"] as Record<string, unknown>;

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

    this.broadcaster.broadcastToInstance(userId, instance, {
      type: "searchUserContentResponded",
      data: transformed,
    });
  };
}

export default Search;
