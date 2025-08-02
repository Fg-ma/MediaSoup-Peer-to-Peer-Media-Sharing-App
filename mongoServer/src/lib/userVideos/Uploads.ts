import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { UserVideosType } from "./typeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Uploads {
  constructor(
    private userVideosCollection: Collection<UserVideosType>,
    private encoder: Encoder
  ) {}

  uploadMetadata = async (data: {
    userId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }) => {
    const mongoData = this.encoder.encodeMetadata(data);

    try {
      await this.userVideosCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetadata = async (
    filter: { userId: string; videoId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
      state?: UserContentStateTypes[];
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

    if (updateData.state !== undefined) {
      updateFields["s"] = updateData.state.map(
        (ate) => userStateEncodingMap[ate]
      );
    }

    try {
      const result = await this.userVideosCollection.updateOne(
        { uid: filter.userId, vid: filter.videoId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
