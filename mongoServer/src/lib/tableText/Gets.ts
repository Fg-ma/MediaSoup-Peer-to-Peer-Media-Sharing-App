import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableTextType } from "./typeConstant";

class Gets {
  constructor(
    private tableTextCollection: Collection<TableTextType>,
    private decoder: Decoder
  ) {}

  getTextMetadataBy_TID_XID = async (tableId: string, textId: string) => {
    try {
      const textData = await this.tableTextCollection.findOne({
        tid: tableId,
        xid: textId,
      });

      if (!textData) {
        return null;
      }

      return this.decoder.decodeMetadata(textData);
    } catch (err) {
      console.error("Error retrieving text data:", err);
      return null;
    }
  };

  getAllBy_TID = async (tableId: string) => {
    try {
      const textData = await this.tableTextCollection
        .find({ tid: tableId })
        .toArray();

      if (!textData || textData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return textData.map((data) => this.decoder.decodeMetadata(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
