import { Collection } from "mongodb";
import Encoder from "./Encoder";

class Uploads {
  constructor(
    private userImagesCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    user_id: string;
    imageId: string;
    filename: string;
    mimeType: string;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userImagesCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { user_id: string; imageId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
    }>
  ) => {
    if (!this.userImagesCollection) {
      console.error("Database not connected");
      return;
    }

    const updateFields: any = {};

    if (updateData.filename) {
      updateFields["n"] = updateData.filename;
    }

    if (updateData.mimeType) {
      updateFields["m"] = updateData.mimeType;
    }

    try {
      const result = await this.userImagesCollection.updateOne(
        { uid: filter.user_id, iid: filter.imageId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
