import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tablesMetaCollection: Collection,
    private decoder: Decoder
  ) {}

  getTableMetaBy_TID = async (tableId: string) => {
    try {
      const tableMetadata = await this.tablesMetaCollection.findOne({
        tid: tableId,
      });

      if (!tableMetadata) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetadata(tableMetadata);
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return null;
    }
  };
}

export default Gets;
