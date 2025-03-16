import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private userTextCollection: Collection,
    private decoder: Decoder
  ) {}

  getTextMetaDataBy_UID_XID = async (user_id: string, textId: string) => {
    try {
      const textData = await this.userTextCollection.findOne({
        uid: user_id,
        xid: textId,
      });

      if (!textData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(textData);
    } catch (err) {
      console.error("Error retrieving text data:", err);
      return null;
    }
  };

  getAllBy_UID = async (user_id: string) => {
    try {
      const textData = await this.userTextCollection
        .find({ uid: user_id })
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
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
