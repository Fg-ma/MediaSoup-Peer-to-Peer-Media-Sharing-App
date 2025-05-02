import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserSvgsType } from "./typeConstant";

class Gets {
  constructor(
    private userSvgsCollection: Collection<UserSvgsType>,
    private decoder: Decoder
  ) {}

  getSvgMetaDataBy_UID_SID = async (userId: string, svgId: string) => {
    try {
      const svgData = await this.userSvgsCollection.findOne({
        uid: userId,
        sid: svgId,
      });

      if (!svgData) {
        return null;
      }

      return this.decoder.decodeMetaData(svgData);
    } catch (err) {
      console.error("Error retrieving svg data:", err);
      return null;
    }
  };

  getAllBy_UID = async (userId: string) => {
    try {
      const svgData = await this.userSvgsCollection
        .find({ uid: userId })
        .toArray();

      if (!svgData || svgData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return svgData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
