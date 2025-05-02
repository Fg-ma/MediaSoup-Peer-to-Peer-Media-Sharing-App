import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { UserImagesType } from "./typeConstant";

class Gets {
  constructor(
    private userImagesCollection: Collection<UserImagesType>,
    private decoder: Decoder
  ) {}

  getImageMetaDataBy_UID_IID = async (userId: string, imageId: string) => {
    try {
      const imageData = await this.userImagesCollection.findOne({
        uid: userId,
        iid: imageId,
      });

      if (!imageData) {
        return null;
      }

      return this.decoder.decodeMetaData(imageData);
    } catch (err) {
      console.error("Error retrieving image data:", err);
      return null;
    }
  };

  getAllBy_UID = async (userId: string) => {
    try {
      const imageData = await this.userImagesCollection
        .find({ uid: userId })
        .toArray();

      if (!imageData || imageData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return imageData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by UID:", err);
      return [];
    }
  };
}

export default Gets;
