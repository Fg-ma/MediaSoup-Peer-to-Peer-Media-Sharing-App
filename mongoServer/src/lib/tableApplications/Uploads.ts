import { Collection } from "mongodb";
import {
  postProcessEffectEncodingMap,
  stateEncodingMap,
} from "../typeConstant";
import Encoder from "./Encoder";
import {
  applicationEffectEncodingMap,
  TableApplicationsType,
} from "./typeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { ContentStateTypes } from "../../../../universal/contentTypeConstant";

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
    state: ContentStateTypes[];
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
      state?: ContentStateTypes[];
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
          filter: { tid: filter.table_id, aid: filter.applicationId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances !== undefined && updateData.instances.length > 0) {
      for (const {
        aiid,
        positioning,
        effects,
        effectStyles,
      } of updateData.instances) {
        if (!aiid) continue;

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

        if (effects !== undefined) {
          const effectValues = Object.keys(effects)
            .filter((effect) => effects[effect as keyof typeof effects])
            .map(
              (effect) =>
                applicationEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (effectStyles !== undefined) {
          instanceSetFields["i.$.es"] = {
            "0": {
              s: postProcessEffectEncodingMap[effectStyles.postProcess.style],
            },
            "1": {
              c: effectStyles.tint.color,
            },
          };
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                aid: filter.applicationId,
                "i.aiid": aiid,
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
        const result = await this.tableApplicationsCollection.bulkWrite(
          bulkOps
        );
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
