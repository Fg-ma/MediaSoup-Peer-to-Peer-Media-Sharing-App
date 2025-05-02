import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { UserSoundClipsType } from "./typeConstant";
import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Uploads {
  constructor(
    private userSoundClipsCollection: Collection<UserSoundClipsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    userId: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userSoundClipsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { userId: string; soundClipId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
      state?: UserContentStateTypes[];
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

    if (updateData.state !== undefined) {
      updateFields["s"] = updateData.state.map(
        (ate) => userStateEncodingMap[ate]
      );
    }

    try {
      const result = await this.userSoundClipsCollection.updateOne(
        { uid: filter.userId, sid: filter.soundClipId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
