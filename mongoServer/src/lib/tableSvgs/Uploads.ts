import { Collection } from "mongodb";
import Encoder from "./Encoder";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap, TableSvgsType } from "./typeConstant";
import { error } from "console";

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
        ({ siid, positioning, effects, effectStyles }) => {
          const instanceUpdate: any = {};

          if (siid) {
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
                    svgEffectEncodingMap[effect as keyof typeof effects]
                );

              instanceUpdate["i.$.e"] = effectValues;
            }

            if (effectStyles) {
              instanceUpdate["i.$.es"] = {
                "0": {
                  c: effectStyles.shadow.shadowColor,
                  s: effectStyles.shadow.strength,
                  x: effectStyles.shadow.offsetX,
                  y: effectStyles.shadow.offsetY,
                },
                "1": {
                  s: effectStyles.blur.strength,
                },
                "2": {
                  s: effectStyles.grayscale.scale,
                },
                "3": {
                  s: effectStyles.saturate.saturation,
                },
                "4": {
                  c: effectStyles.colorOverlay.overlayColor,
                },
                "5": {
                  f: effectStyles.waveDistortion.frequency,
                  s: effectStyles.waveDistortion.strength,
                },
                "6": {
                  n: effectStyles.crackedGlass.density,
                  d: effectStyles.crackedGlass.detail,
                  s: effectStyles.crackedGlass.strength,
                },
                "7": {
                  c: effectStyles.neonGlow.neonColor,
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
      const result = await this.tableSvgsCollection.updateOne(
        { tid: filter.table_id, sid: filter.svgId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
