import { Collection } from "mongodb";
import Encoder from "./Encoder";

class Uploads {
  constructor(
    private userSoundClipsCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    user_id: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userSoundClipsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { user_id: string; soundClipId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
    }>
  ) => {
    if (!this.userSoundClipsCollection) {
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
      const result = await this.userSoundClipsCollection.updateOne(
        { uid: filter.user_id, sid: filter.soundClipId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
