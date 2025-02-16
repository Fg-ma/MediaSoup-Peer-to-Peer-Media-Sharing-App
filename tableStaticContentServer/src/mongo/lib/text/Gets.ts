import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableTextCollection: Collection,
    private decoder: Decoder
  ) {}

  getTextMetaDataBy_TID_XID = async (table_id: string, textId: string) => {
    try {
      const textData = await this.tableTextCollection.findOne({
        tid: table_id,
        xid: textId,
      });

      if (!textData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(textData);
    } catch (err) {
      console.error("Error retrieving vidoe data:", err);
      return null;
    }
  };

  getAllBy_TID = async (table_id: string) => {
    try {
      const textData = await this.tableTextCollection
        .find({ tid: table_id })
        .toArray();

      if (!textData || textData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return textData.map((data) =>
        // @ts-expect-error: mongo doesn't have typing
        this.decoder.decodeMetaData(data)
      );
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
