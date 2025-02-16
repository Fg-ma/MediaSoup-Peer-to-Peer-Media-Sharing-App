import { Collection } from "mongodb";
import Decoder from "./Decoder";

class Gets {
  constructor(
    private tableImagesCollection: Collection,
    private decoder: Decoder
  ) {}

  getImageMetaDataBy_TID_IID = async (table_id: string, imageId: string) => {
    try {
      const imageData = await this.tableImagesCollection.findOne({
        tid: table_id,
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

  getAllBy_TID = async (table_id: string) => {
    try {
      const imageData = await this.tableImagesCollection
        .find({ tid: table_id })
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
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
