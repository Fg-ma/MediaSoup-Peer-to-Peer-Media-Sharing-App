import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";
import { UserSvgsType } from "./typeConstant";

class Uploads {
  constructor(
    private userSvgsCollection: Collection<UserSvgsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    userId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.userSvgsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { userId: string; svgId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
      state?: UserContentStateTypes[];
    }>
  ) => {
    if (!this.userSvgsCollection) {
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
      const result = await this.userSvgsCollection.updateOne(
        { tid: filter.userId, sid: filter.svgId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
