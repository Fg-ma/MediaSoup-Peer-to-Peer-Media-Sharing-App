import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableTextsCollection: Collection,
    private decoder: Decoder
  ) {}

  getTextMetaDataBy_TID_XID = async (table_id: string, textId: string) => {
    try {
      const textData = await this.tableTextsCollection.findOne({
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
}

export default Gets;
