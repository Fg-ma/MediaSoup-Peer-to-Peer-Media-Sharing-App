import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserTextType } from "./typeConstant";

class Gets {
  constructor(
    private userTextCollection: Collection<UserTextType>,
    private decoder: Decoder
  ) {}

  getTextMetadataBy_UID_XID = async (userId: string, textId: string) => {
    try {
      const textData = await this.userTextCollection.findOne({
        uid: userId,
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

  getAllBy_UID = async (userId: string) => {
    try {
      const textData = await this.userTextCollection
        .find({ uid: userId })
        .toArray();

      if (!textData || textData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return textData.map((data) => this.decoder.decodeMetadata(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
