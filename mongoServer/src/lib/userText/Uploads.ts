import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { UserTextType } from "./typeConstant";
import { userStateEncodingMap } from "../typeConstant";
import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";

class Uploads {
  constructor(
    private userTextCollection: Collection<UserTextType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    userId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userTextCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { userId: string; textId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
      state?: UserContentStateTypes[];
    }>
  ) => {
    if (!this.userTextCollection) {
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
      const result = await this.userTextCollection.updateOne(
        { uid: filter.userId, xid: filter.textId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
