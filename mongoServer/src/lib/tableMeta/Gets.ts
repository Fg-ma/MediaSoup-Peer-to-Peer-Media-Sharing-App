import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tablesMetaCollection: Collection,
    private decoder: Decoder
  ) {}

  getTableMetaBy_TID = async (table_id: string) => {
    try {
      const tableMetaData = await this.tablesMetaCollection.findOne({
        tid: table_id,
      });

      if (!tableMetaData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(tableMetaData);
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return null;
    }
  };
}

export default Gets;
