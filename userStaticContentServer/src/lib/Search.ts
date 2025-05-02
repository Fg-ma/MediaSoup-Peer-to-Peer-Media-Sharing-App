import { onSearchUserContentRequestType } from "../typeConstant";
import Broadcaster from "./Broadcaster";
import elasticSearch from "../../../elasticSearchServer/src/index";

class Search {
  private indexMap: Record<string, string> = {
    application: "mongo.tabletopmongo.userapplications",
    image: "mongo.tabletopmongo.userimages",
    soundClip: "mongo.tabletopmongo.usersoundclips",
    svg: "mongo.tabletopmongo.usersvgs",
    text: "mongo.tabletopmongo.usertext",
    video: "mongo.tabletopmongo.uservideos",
  };

  private searchTabledWhitelist = ["iid", "aid", "sid", "xid", "vid"];

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
      const source = hit["_source"] as any;

      if (source && Array.isArray(source["s"]) && source["s"].includes(0)) {
        const filteredSource: Record<string, any> = {};

        for (const [key, value] of Object.entries(source)) {
          if (this.searchTabledWhitelist.includes(key)) {
            filteredSource[key] = value;
          }
        }

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
