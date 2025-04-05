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
import { TableVideosType, videoEffectEncodingMap } from "./typeConstant";
import {
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../universal/effectsTypeConstant";

class Uploads {
  constructor(
    private tableVideosCollection: Collection<TableVideosType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    videoId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      videoInstanceId: string;
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
        [effectType in VideoEffectTypes]: boolean;
      };
      effectStyles: VideoEffectStylesType;
      videoPosition: number;
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableVideosCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; videoId: string },
    updateData: Partial<{
      tabled?: boolean;
      filename?: string;
      mimeType?: string;
      instances?: {
        viid: string;
        positioning?: {
          position?: { left?: number; top?: number };
          scale?: { x?: number; y?: number };
          rotation?: number;
        };
        effects?: { [effectType in VideoEffectTypes]?: boolean };
        effectStyles?: VideoEffectStylesType;
        videoPosition?: number;
      }[];
    }>
  ) => {
    if (!this.tableVideosCollection) {
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
          filter: { tid: filter.table_id, vid: filter.videoId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances && updateData.instances.length > 0) {
      for (const {
        viid,
        positioning,
        effects,
        effectStyles,
        videoPosition,
      } of updateData.instances) {
        if (!viid) continue;

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
              (effect) => videoEffectEncodingMap[effect as keyof typeof effects]
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

        if (videoPosition) {
          instanceSetFields["i.$.vp"] = videoPosition;
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                vid: filter.videoId,
                "i.viid": viid,
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
        const result = await this.tableVideosCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
