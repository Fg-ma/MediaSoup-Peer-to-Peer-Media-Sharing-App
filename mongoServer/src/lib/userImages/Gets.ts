import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private userImagesCollection: Collection,
    private decoder: Decoder
  ) {}

  getImageMetaDataBy_UID_IID = async (user_id: string, imageId: string) => {
    try {
      const imageData = await this.userImagesCollection.findOne({
        uid: user_id,
        iid: imageId,
      });

      if (!imageData) {
        return null;
      }

      // @ts-expect-error: mongo doesn't have typing
      return this.decoder.decodeMetaData(imageData);
    } catch (err) {
      console.error("Error retrieving image data:", err);
      return null;
    }
  };

  getAllBy_UID = async (user_id: string) => {
    try {
      const imageData = await this.userImagesCollection
        .find({ uid: user_id })
        .toArray();

      if (!imageData || imageData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return imageData.map((data) =>
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
