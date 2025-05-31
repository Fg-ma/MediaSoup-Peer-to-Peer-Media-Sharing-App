import { Collection } from "mongodb";
import Encoder from "./Encoder";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap, TableSvgsType } from "./typeConstant";
import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { tableStateEncodingMap } from "../typeConstant";

class Uploads {
  constructor(
    private tableSvgsCollection: Collection<TableSvgsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    tableId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
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
    filter: { tableId: string; svgId: string },
    updateData: Partial<{
      state?: TableContentStateTypes[];
      filename?: string;
      mimeType?: string;
      instances?: {
        svgInstanceId: string;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulkOps: any[] = [];

    // 1. General metadata update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generalSetFields: Record<string, any> = {};

    if (updateData.filename !== undefined) {
      generalSetFields["n"] = updateData.filename;
    }

    if (updateData.mimeType !== undefined) {
      generalSetFields["m"] = updateData.mimeType;
    }

    if (updateData.state !== undefined) {
      generalSetFields["s"] = updateData.state.map(
        (ate) => tableStateEncodingMap[ate]
      );
    }

    if (Object.keys(generalSetFields).length > 0) {
      bulkOps.push({
        updateOne: {
          filter: { tid: filter.tableId, sid: filter.svgId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances !== undefined && updateData.instances.length > 0) {
      for (const {
        svgInstanceId,
        positioning,
        effects,
        effectStyles,
      } of updateData.instances) {
        if (!svgInstanceId) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              (effect) => svgEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (effectStyles !== undefined) {
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
                tid: filter.tableId,
                sid: filter.svgId,
                "i.siid": svgInstanceId,
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

  addNewInstances = async (
    filter: { tableId: string; svgId: string },
    updateData: {
      svgInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effects: { [effectType in SvgEffectTypes]: boolean };
      effectStyles: SvgEffectStylesType;
    }[]
  ) => {
    if (!this.tableSvgsCollection) {
      console.error("Database not connected");
      return;
    }

    if (updateData && updateData.length > 0) {
      const pushInstances = updateData.map(
        ({ svgInstanceId, positioning, effects, effectStyles }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p: any = {
            p: {
              l: positioning.position.left,
              t: positioning.position.top,
            },
            s: {
              x: positioning.scale.x,
              y: positioning.scale.y,
            },
            r: positioning.rotation,
          };

          const e = Object.keys(effects)
            .filter((effect) => effects[effect as keyof typeof effects])
            .map(
              (effect) => svgEffectEncodingMap[effect as keyof typeof effects]
            );

          const es = {
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

          return {
            siid: svgInstanceId,
            p,
            e,
            es,
          };
        }
      );

      try {
        const result = await this.tableSvgsCollection.updateOne(
          {
            tid: filter.tableId,
            sid: filter.svgId,
          },
          {
            $push: {
              i: {
                $each: pushInstances,
              },
            },
          }
        );

        return result;
      } catch (err) {
        console.error("Update error:", err);
      }
    }
  };
}

export default Uploads;
