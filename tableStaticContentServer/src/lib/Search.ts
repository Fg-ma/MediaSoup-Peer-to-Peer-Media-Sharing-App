import { onSearchTabledContentRequestType } from "../typeConstant";
import Broadcaster from "./Broadcaster";
import elasticSearch from "../../../elasticSearchServer/src/index";

class Search {
  private indexMap: Record<string, string> = {
    application: "mongo.tabletopmongo.tableapplications",
    image: "mongo.tabletopmongo.tableimages",
    soundClip: "mongo.tabletopmongo.tablesoundclips",
    svg: "mongo.tabletopmongo.tablesvgs",
    text: "mongo.tabletopmongo.tabletext",
    video: "mongo.tabletopmongo.tablevideos",
  };

  private searchTabledWhitelist = ["iid", "aid", "sid", "xid", "vid"];

  constructor(private broadcaster: Broadcaster) {}

  onSearchTabledContentRequest = async (
    event: onSearchTabledContentRequestType
  ) => {
    const { table_id, username, instance, contentType, name } = event.header;

    // build your list of indices
    let indices: string;
    if (contentType === "all") {
      indices = Object.values(this.indexMap).join(",");
    } else {
      indices = this.indexMap[contentType]!;
    }

    const boolQuery = {
      bool: {
        filter: [{ term: { tid: table_id } }],
        must: [{ match: { n: name } }],
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

    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "searchTabledContentResponded",
      data: transformed,
    });
  };
}

export default Search;
