import { Collection } from "mongodb";
import { postProcessEffectEncodingMap } from "../typeConstant";
import Encoder from "./Encoder";
import {
  applicationEffectEncodingMap,
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "./typeConstant";

class Uploads {
  constructor(
    private tableApplicationsCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    applicationId: string;
    filename: string;
    mimeType: string;
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
    effects: {
      [effectType in ApplicationEffectTypes]: boolean;
    };
    effectStyles: ApplicationEffectStylesType;
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableApplicationsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; applicationId: string },
    updateData: Partial<{
      positioning?: {
        position?: { left?: number; top?: number };
        scale?: { x?: number; y?: number };
        rotation?: number;
      };
      effects?: { [effectType in ApplicationEffectTypes]?: boolean };
      effectStyles?: ApplicationEffectStylesType;
    }>
  ) => {
    if (!this.tableApplicationsCollection) {
      console.error("Database not connected");
      return;
    }

    const updateFields: any = {};

    if (updateData.positioning) {
      if (updateData.positioning.position) {
        if (updateData.positioning.position.left !== undefined) {
          updateFields["p.p.l"] = updateData.positioning.position.left;
        }
        if (updateData.positioning.position.top !== undefined) {
          updateFields["p.p.t"] = updateData.positioning.position.top;
        }
      }
      if (updateData.positioning.scale) {
        if (updateData.positioning.scale.x !== undefined) {
          updateFields["p.s.x"] = updateData.positioning.scale.x;
        }
        if (updateData.positioning.scale.y !== undefined) {
          updateFields["p.s.y"] = updateData.positioning.scale.y;
        }
      }
      if (updateData.positioning.rotation !== undefined) {
        updateFields["p.r"] = updateData.positioning.rotation;
      }
    }

    if (updateData.effects) {
      updateFields["e"] = Object.keys(updateData.effects)
        .filter(
          (effect) =>
            updateData.effects?.[effect as keyof typeof updateData.effects]
        )
        .map(
          (effect) =>
            applicationEffectEncodingMap[
              effect as keyof typeof updateData.effects
            ]
        );
    }

    if (updateData.effectStyles) {
      updateFields["es"] = {
        "0": {
          s: postProcessEffectEncodingMap[
            updateData.effectStyles.postProcess.style
          ],
        },
      };
    }

    try {
      const result = await this.tableApplicationsCollection.updateOne(
        { tid: filter.table_id, vid: filter.applicationId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
