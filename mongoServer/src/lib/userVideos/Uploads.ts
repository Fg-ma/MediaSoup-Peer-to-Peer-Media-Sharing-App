import { Collection } from "mongodb";

import Encoder from "./Encoder";

class Uploads {
  constructor(
    private userVideosCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    user_id: string;
    videoId: string;
    filename: string;
    mimeType: string;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userVideosCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { user_id: string; videoId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
    }>
  ) => {
    if (!this.userVideosCollection) {
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
      const result = await this.userVideosCollection.updateOne(
        { uid: filter.user_id, vid: filter.videoId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
