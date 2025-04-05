import { Collection } from "mongodb";
import {
  beardsEffectEncodingMap,
  glassesEffectEncodingMap,
  hatsEffectEncodingMap,
  hideBackgroundEffectEncodingMap,
  masksEffectEncodingMap,
  mustachesEffectEncodingMap,
  petsEffectEncodingMap,
  postProcessEffectEncodingMap,
} from "../typeConstant";
import Encoder from "./Encoder";
import { imageEffectEncodingMap, TableImagesType } from "./typeConstant";
import {
  ImageEffectStylesType,
  ImageEffectTypes,
} from "../../../../universal/effectsTypeConstant";

class Uploads {
  constructor(
    private tableImagesCollection: Collection<TableImagesType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    imageId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      imageInstanceId: string;
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
        [effectType in ImageEffectTypes]: boolean;
      };
      effectStyles: ImageEffectStylesType;
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableImagesCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; imageId: string },
    updateData: Partial<{
      tabled?: boolean;
      filename?: string;
      mimeType?: string;
      instances?: {
        iiid: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
        effects?: { [effectType in ImageEffectTypes]?: boolean };
        effectStyles?: ImageEffectStylesType;
      }[];
    }>
  ) => {
    if (!this.tableImagesCollection) {
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
          filter: { tid: filter.table_id, iid: filter.imageId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances && updateData.instances.length > 0) {
      for (const {
        iiid,
        positioning,
        effects,
        effectStyles,
      } of updateData.instances) {
        if (!iiid) continue;

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
              (effect) => imageEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (effectStyles) {
          instanceSetFields["i.$.es"] = {
            "0": {
              s: postProcessEffectEncodingMap[effectStyles.postProcess.style],
            },
            "1": {
              s: hideBackgroundEffectEncodingMap[
                effectStyles.hideBackground.style
              ],
              c: effectStyles.hideBackground.color,
            },
            "2": {
              c: effectStyles.tint.color,
            },
            "3": {
              s: glassesEffectEncodingMap[effectStyles.glasses.style],
            },
            "4": {
              s: beardsEffectEncodingMap[effectStyles.beards.style],
            },
            "5": {
              s: mustachesEffectEncodingMap[effectStyles.mustaches.style],
            },
            "6": {
              s: masksEffectEncodingMap[effectStyles.masks.style],
            },
            "7": {
              s: hatsEffectEncodingMap[effectStyles.hats.style],
            },
            "8": {
              s: petsEffectEncodingMap[effectStyles.pets.style],
            },
          };
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                iid: filter.imageId,
                "i.iiid": iiid,
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
        const result = await this.tableImagesCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
