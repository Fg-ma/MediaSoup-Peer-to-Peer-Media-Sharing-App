import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { TableTextType } from "./typeConstant";
import { ContentStateTypes } from "../../../../universal/contentTypeConstant";
import { stateEncodingMap } from "../typeConstant";

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
    state: ContentStateTypes[];
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
      state?: ContentStateTypes[];
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

    const bulkOps: any[] = [];

    // 1. General metadata update
    const generalSetFields: Record<string, any> = {};

    if (updateData.filename !== undefined) {
      generalSetFields["n"] = updateData.filename;
    }

    if (updateData.mimeType !== undefined) {
      generalSetFields["m"] = updateData.mimeType;
    }

    if (updateData.state !== undefined) {
      generalSetFields["s"] = updateData.state.map(
        (ate) => stateEncodingMap[ate]
      );
    }

    if (Object.keys(generalSetFields).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { tid: filter.table_id, xid: filter.textId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances !== undefined && updateData.instances.length > 0) {
      for (const { xiid, positioning } of updateData.instances) {
        if (!xiid) continue;

        const instanceSetFields: Record<string, any> = {};

        if (positioning !== undefined) {
          if (positioning.position?.left !== undefined) {
            instanceSetFields["i.$.p.p.l"] = positioning.position.left;
          }
          if (positioning.position?.top !== undefined) {
            instanceSetFields["i.$.p.p.t"] = positioning.position.top;
          }
          if (positioning.scale?.x !== undefined) {
            instanceSetFields["i.$.p.s.x"] = positioning.scale.x;
          }
          if (positioning.scale?.y !== undefined) {
            instanceSetFields["i.$.p.s.y"] = positioning.scale.y;
          }
          if (positioning.rotation !== undefined) {
            instanceSetFields["i.$.p.r"] = positioning.rotation;
          }
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                xid: filter.textId,
                "i.xiid": xiid,
              },
              update: { $set: instanceSetFields },
            },
          });
        }
      }
    }

    // Execute bulkWrite
    if (bulkOps.length > 0) {
      try {
        const result = await this.tableTextCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
