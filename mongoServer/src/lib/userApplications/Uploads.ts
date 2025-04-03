import { Collection } from "mongodb";
import Encoder from "./Encoder";

class Uploads {
  constructor(
    private userApplicationsCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    user_id: string;
    applicationId: string;
    filename: string;
    mimeType: string;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userApplicationsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { user_id: string; applicationId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
    }>
  ) => {
    if (!this.userApplicationsCollection) {
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
      const result = await this.userApplicationsCollection.updateOne(
        { uid: filter.user_id, aid: filter.applicationId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
