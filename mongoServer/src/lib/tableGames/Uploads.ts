import { Collection } from "mongodb";
import Encoder from "./Encoder";
import { GameTypes } from "../../../../universal/contentTypeConstant";
import { TableGamesType } from "./typeConstant";

class Uploads {
  constructor(
    private tableGamesCollection: Collection<TableGamesType>,
    private encoder: Encoder
  ) {}

  uploadMetadata = async (data: {
    tableId: string;
    gameId: string;
    gameType: GameTypes;
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
  }) => {
    const mongoData = this.encoder.encodeMetadata(data);

    try {
      await this.tableGamesCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetadata = async (
    filter: { tableId: string; gameId: string },
    updateData: Partial<{
      positioning?: {
        position?: { left?: number; top?: number };
        scale?: { x?: number; y?: number };
        rotation?: number;
      };
    }>
  ) => {
    if (!this.tableGamesCollection) {
      console.error("Database not connected");
      return;
    }

    // 1. General metadata update
    // eslint-disable-next-line
    const generalSetFields: Record<string, any> = {};

    if (updateData.positioning !== undefined) {
      if (updateData.positioning.position?.left !== undefined) {
        generalSetFields["p.p.l"] = updateData.positioning.position.left;
      }
      if (updateData.positioning.position?.top !== undefined) {
        generalSetFields["p.p.t"] = updateData.positioning.position.top;
      }
      if (updateData.positioning.scale?.x !== undefined) {
        generalSetFields["p.s.x"] = updateData.positioning.scale.x;
      }
      if (updateData.positioning.scale?.y !== undefined) {
        generalSetFields["p.s.y"] = updateData.positioning.scale.y;
      }
      if (updateData.positioning.rotation !== undefined) {
        generalSetFields["p.r"] = updateData.positioning.rotation;
      }
    }

    if (Object.keys(generalSetFields).length > 0) {
      try {
        const result = await this.tableGamesCollection.updateOne(
          { tid: filter.tableId, gid: filter.gameId },
          { $set: generalSetFields }
        );
        return result;
      } catch (err) {
        console.error("Update error:", err);
      }
    }
  };
}

export default Uploads;
