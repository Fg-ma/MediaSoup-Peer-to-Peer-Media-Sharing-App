import { Collection } from "mongodb";
import Decoder from "./Decoder";
import { TableImagesType } from "./typeConstant";

class Gets {
  constructor(
    private tableImagesCollection: Collection<TableImagesType>,
    private decoder: Decoder
  ) {}

  getImageMetaDataBy_TID_IID = async (tableId: string, imageId: string) => {
    try {
      const imageData = await this.tableImagesCollection.findOne({
        tid: tableId,
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

  getAllBy_TID = async (tableId: string) => {
    try {
      const imageData = await this.tableImagesCollection
        .find({ tid: tableId })
        .toArray();

      if (!imageData || imageData.length === 0) {
        return [];
      }

      // Decode metadata for all documents
      return imageData.map((data) => this.decoder.decodeMetaData(data));
    } catch (err) {
      console.error("Error retrieving data by TID:", err);
      return [];
    }
  };
}

export default Gets;
