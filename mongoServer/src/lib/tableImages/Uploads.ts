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
        ({ iiid, positioning, effects, effectStyles }) => {
          const instanceUpdate: any = {};

          if (iiid) {
            // If positioning is provided, update the relevant fields
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

            // Update effects (using $set to modify the array element)
            if (effects) {
              const effectValues = Object.keys(effects)
                .filter((effect) => effects?.[effect as keyof typeof effects])
                .map(
                  (effect) =>
                    imageEffectEncodingMap[effect as keyof typeof effects]
                );

              instanceUpdate["i.$.e"] = effectValues;
            }

            // Update effectStyles (again, modifying the specific instance in the array)
            if (effectStyles) {
              instanceUpdate["i.$.es"] = {
                "0": {
                  s: postProcessEffectEncodingMap[
                    effectStyles.postProcess.style
                  ],
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
          }

          // Add the instanceUpdate to the updateFields object
          if (Object.keys(instanceUpdate).length > 0) {
            updateFields["$set"] = instanceUpdate;
          }
        }
      );
    }

    try {
      const result = await this.tableImagesCollection.updateOne(
        { tid: filter.table_id, iid: filter.imageId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
