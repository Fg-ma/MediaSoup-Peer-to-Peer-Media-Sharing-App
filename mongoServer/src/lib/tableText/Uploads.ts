import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { TableTextType } from "./typeConstant";

class Uploads {
  constructor(
    private tableTextCollection: Collection<TableTextType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    textId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      textInstanceId: string;
      positioning: {
        position: {
          left: number;
          top: number;
        };
        scale: {
          x: number;
          y: number;
        };
        rotation: number;
      };
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableTextCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; textId: string },
    updateData: Partial<{
      tabled?: boolean;
      filename?: string;
      mimeType?: string;
      instances?: {
        xiid: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
      }[];
    }>
  ) => {
    if (!this.tableTextCollection) {
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

    if (updateData.tabled) {
      updateFields["t"] = updateData.tabled;
    }

    if (updateData.instances && updateData.instances.length > 0) {
      updateData.instances.forEach(({ xiid, positioning }) => {
        const instanceUpdate: any = {};

        if (xiid) {
          if (positioning) {
            if (positioning.position) {
              if (positioning.position.left !== undefined) {
                instanceUpdate["i.$.p.p.l"] = positioning.position.left;
              }
              if (positioning.position.top !== undefined) {
                instanceUpdate["i.$.p.p.t"] = positioning.position.top;
              }
            }
            if (positioning.scale) {
              if (positioning.scale.x !== undefined) {
                instanceUpdate["i.$.p.s.x"] = positioning.scale.x;
              }
              if (positioning.scale.y !== undefined) {
                instanceUpdate["i.$.p.s.y"] = positioning.scale.y;
              }
            }
            if (positioning.rotation !== undefined) {
              instanceUpdate["i.$.p.r"] = positioning.rotation;
            }
          }

          if (Object.keys(instanceUpdate).length > 0) {
            updateFields["$set"] = instanceUpdate;
          }
        }
      });
    }

    try {
      const result = await this.tableTextCollection.updateOne(
        { tid: filter.table_id, xid: filter.textId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
