import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableTextType } from "./typeConstant";

class Gets {
  constructor(
    private tableTextCollection: Collection<TableTextType>,
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

      return this.decoder.decodeMetaData(textData);
    } catch (err) {
      console.error("Error retrieving text data:", err);
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
      return textData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
