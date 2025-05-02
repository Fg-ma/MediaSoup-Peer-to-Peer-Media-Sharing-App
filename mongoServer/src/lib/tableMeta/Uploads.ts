import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { TableColors } from "../typeConstant";

class Uploads {
  constructor(
    private tablesMetaCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    tableId: string;
    tableName: string;
    owner: string;
    members: {
      memberId: string;
      permissions: {
        read: boolean;
        write: boolean;
        delete: boolean;
      };
      seat: number;
      online: boolean;
      priority: number;
      color: TableColors;
    }[];
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
    filter: { tableId: string },
    updateData: Partial<{
      tableName?: string;
      owner?: string;
      members?: {
        memberId: string;
        permissions?: {
          read?: boolean;
          write?: boolean;
          delete?: boolean;
        };
        seat?: number;
        online?: boolean;
        priority?: number;
        color?: TableColors;
      }[];
      interactionOrder?: string[];
      backgroundMedia?: string | null;
      backgroundImage?: string | null;
    }>
  ) => {
    if (!this.tablesMetaCollection) {
      console.error("Database not connected");
      return;
    }

    const updateFields: Record<string, any> = {};
    const arrayFilters: Record<string, any>[] = [];

    if (updateData.tableName) {
      updateFields["tn"] = updateData.tableName;
    }

    if (updateData.owner) {
      updateFields["ow"] = updateData.owner;
    }

    if (updateData.members && updateData.members.length > 0) {
      updateData.members.forEach((member, index) => {
        const memberUpdates: Record<string, any> = {};

        if (member.permissions) {
          if (member.permissions.read !== undefined) {
            memberUpdates["p.r"] = member.permissions.read;
          }
          if (member.permissions.write !== undefined) {
            memberUpdates["p.w"] = member.permissions.write;
          }
          if (member.permissions.delete !== undefined) {
            memberUpdates["p.d"] = member.permissions.delete;
          }
        }

        if (member.seat !== undefined) {
          memberUpdates["s"] = member.seat;
        }

        if (member.online !== undefined) {
          memberUpdates["o"] = member.online;
        }

        if (member.priority !== undefined) {
          memberUpdates["p"] = member.priority;
        }

        if (member.color !== undefined) {
          memberUpdates["c"] = member.color;
        }

        if (Object.keys(memberUpdates).length > 0) {
          Object.keys(memberUpdates).forEach((key) => {
            updateFields[`mm.$[elem${index}].${key}`] = memberUpdates[key];
          });
          arrayFilters.push({ [`elem${index}.id`]: member.memberId });
        }
      });
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
      const updateQuery: any = { $set: updateFields };
      const options = arrayFilters.length > 0 ? { arrayFilters } : {};

      const result = await this.tablesMetaCollection.updateOne(
        { tid: filter.tableId },
        updateQuery,
        options
      );

      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
