import { Collection } from "mongodb";
import Encoder from "./Encoder";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap, TableSvgsType } from "./typeConstant";

class Uploads {
  constructor(
    private tableSvgsCollection: Collection<TableSvgsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      svgInstanceId: string;
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
        [effectType in SvgEffectTypes]: boolean;
      };
      effectStyles: SvgEffectStylesType;
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableSvgsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; svgId: string },
    updateData: Partial<{
      tabled?: boolean;
      filename?: string;
      mimeType?: string;
      instances?: {
        siid: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
        effects?: { [effectType in SvgEffectTypes]?: boolean };
        effectStyles?: SvgEffectStylesType;
      }[];
    }>
  ) => {
    if (!this.tableSvgsCollection) {
      console.error("Database not connected");
      return;
    }

    const bulkOps: any[] = [];

    // 1. General metadata update
    const generalSetFields: Record<string, any> = {};

    if (updateData.filename) {
      generalSetFields["n"] = updateData.filename;
    }

    if (updateData.mimeType) {
      generalSetFields["m"] = updateData.mimeType;
    }

    if (updateData.tabled !== undefined) {
      generalSetFields["t"] = updateData.tabled;
    }

    if (Object.keys(generalSetFields).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { tid: filter.table_id, sid: filter.svgId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances && updateData.instances.length > 0) {
      for (const {
        siid,
        positioning,
        effects,
        effectStyles,
      } of updateData.instances) {
        if (!siid) continue;

        const instanceSetFields: Record<string, any> = {};

        if (positioning) {
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

        if (effects) {
          const effectValues = Object.keys(effects)
            .filter((effect) => effects[effect as keyof typeof effects])
            .map(
              (effect) => svgEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (effectStyles) {
          instanceSetFields["i.$.es"] = {
            "0": {
              c: effectStyles.shadow.shadowColor,
              s: effectStyles.shadow.strength,
              x: effectStyles.shadow.offsetX,
              y: effectStyles.shadow.offsetY,
            },
            "1": { s: effectStyles.blur.strength },
            "2": { s: effectStyles.grayscale.scale },
            "3": { s: effectStyles.saturate.saturation },
            "4": { c: effectStyles.colorOverlay.overlayColor },
            "5": {
              f: effectStyles.waveDistortion.frequency,
              s: effectStyles.waveDistortion.strength,
            },
            "6": {
              n: effectStyles.crackedGlass.density,
              d: effectStyles.crackedGlass.detail,
              s: effectStyles.crackedGlass.strength,
            },
            "7": { c: effectStyles.neonGlow.neonColor },
          };
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                sid: filter.svgId,
                "i.siid": siid,
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
        const result = await this.tableSvgsCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
