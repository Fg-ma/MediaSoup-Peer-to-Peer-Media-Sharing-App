import { Collection } from "mongodb";
import { postProcessEffectEncodingMap } from "../typeConstant";
import Encoder from "./Encoder";
import {
  applicationEffectEncodingMap,
  TableApplicationsType,
} from "./typeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";

class Uploads {
  constructor(
    private tableApplicationsCollection: Collection<TableApplicationsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    applicationId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      applicationInstanceId: string;
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
    }[];
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
      tabled?: boolean;
      filename?: string;
      mimeType?: string;
      instances?: {
        aiid: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
        effects?: { [effectType in ApplicationEffectTypes]?: boolean };
        effectStyles?: ApplicationEffectStylesType;
      }[];
    }>
  ) => {
    if (!this.tableApplicationsCollection) {
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
      updateData.instances.forEach(
        ({ aiid, positioning, effects, effectStyles }) => {
          const instanceUpdate: any = {};

          if (aiid) {
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

            if (effects) {
              const effectValues = Object.keys(effects)
                .filter((effect) => effects?.[effect as keyof typeof effects])
                .map(
                  (effect) =>
                    applicationEffectEncodingMap[effect as keyof typeof effects]
                );

              instanceUpdate["i.$.e"] = effectValues;
            }

            if (effectStyles) {
              instanceUpdate["i.$.es"] = {
                "0": {
                  s: postProcessEffectEncodingMap[
                    effectStyles.postProcess.style
                  ],
                },
                "1": {
                  c: effectStyles.tint.color,
                },
              };
            }
          }

          if (Object.keys(instanceUpdate).length > 0) {
            updateFields["$set"] = instanceUpdate;
          }
        }
      );
    }

    try {
      const result = await this.tableApplicationsCollection.updateOne(
        { tid: filter.table_id, aid: filter.applicationId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
