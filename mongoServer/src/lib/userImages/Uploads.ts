import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";
import { UserImagesType } from "./typeConstant";

class Uploads {
  constructor(
    private userImagesCollection: Collection<UserImagesType>,
    private encoder: Encoder
  ) {}

  uploadMetadata = async (data: {
    userId: string;
    imageId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }) => {
    const mongoData = this.encoder.encodeMetadata(data);

    try {
      await this.userImagesCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetadata = async (
    filter: { userId: string; imageId: string },
    updateData: Partial<{
      filename?: string;
      mimeType?: string;
      state?: UserContentStateTypes[];
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

    if (updateData.state !== undefined) {
      updateFields["s"] = updateData.state.map(
        (ate) => userStateEncodingMap[ate]
      );
    }

    try {
      const result = await this.userImagesCollection.updateOne(
        { uid: filter.userId, iid: filter.imageId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
