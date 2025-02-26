import { Collection } from "mongodb";
import Encoder from "./Encoder";

class Uploads {
  constructor(
    private tablesMetaCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    tableName: string;
    owner: string;
    members: string[];
    priority: string[];
    interactionOrder: string[];
    backgroundMedia: string | null;
    backgroundImage: string | null;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tablesMetaCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string },
    updateData: Partial<{
      tableName?: string;
      owner?: string;
      members?: string[];
      priority?: string[];
      interactionOrder?: string[];
      backgroundMedia?: string | null;
      backgroundImage?: string | null;
    }>
  ) => {
    if (!this.tablesMetaCollection) {
      console.error("Database not connected");
      return;
    }

    const updateFields: any = {};

    if (updateData.tableName) {
      updateFields["tn"] = updateData.tableName;
    }

    if (updateData.owner) {
      updateFields["ow"] = updateData.owner;
    }

    if (updateData.members) {
      updateFields["mm"] = updateData.members;
    }

    if (updateData.priority) {
      updateFields["p"] = updateData.priority;
    }

    if (updateData.interactionOrder) {
      updateFields["io"] = updateData.interactionOrder;
    }

    if (updateData.backgroundMedia) {
      updateFields["bm"] = updateData.backgroundMedia;
    }

    if (updateData.backgroundImage) {
      updateFields["bi"] = updateData.backgroundImage;
    }

    try {
      const result = await this.tablesMetaCollection.updateOne(
        { tid: filter.table_id },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
