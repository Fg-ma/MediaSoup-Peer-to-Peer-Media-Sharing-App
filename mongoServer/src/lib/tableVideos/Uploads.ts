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
  tableStateEncodingMap,
} from "../typeConstant";
import Encoder from "./Encoder";
import { TableVideosType, videoEffectEncodingMap } from "./typeConstant";
import {
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";

class Uploads {
  constructor(
    private tableVideosCollection: Collection<TableVideosType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    tableId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
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
    filter: { tableId: string; videoId: string },
    updateData: Partial<{
      state?: TableContentStateTypes[];
      filename?: string;
      mimeType?: string;
      instances?: {
        videoInstanceId: string;
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
          filter: { tid: filter.tableId, vid: filter.videoId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances !== undefined && updateData.instances.length > 0) {
      for (const {
        videoInstanceId,
        positioning,
        effects,
        effectStyles,
        videoPosition,
      } of updateData.instances) {
        if (!videoInstanceId) continue;

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
              (effect) => videoEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (effectStyles !== undefined) {
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
                tid: filter.tableId,
                vid: filter.videoId,
                "i.viid": videoInstanceId,
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

  addNewInstances = async (
    filter: { tableId: string; videoId: string },
    updateData: {
      videoInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effects: { [effectType in VideoEffectTypes]: boolean };
      effectStyles: VideoEffectStylesType;
      videoPosition: number;
    }[]
  ) => {
    if (!this.tableVideosCollection) {
      console.error("Database not connected");
      return;
    }

    if (updateData && updateData.length > 0) {
      const pushInstances = updateData.map(
        ({
          videoInstanceId,
          positioning,
          effects,
          effectStyles,
          videoPosition,
        }) => {
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
              (effect) => videoEffectEncodingMap[effect as keyof typeof effects]
            );

          const es = {
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

          const vp = videoPosition;

          return {
            viid: videoInstanceId,
            p,
            e,
            es,
            vp,
          };
        }
      );

      try {
        const result = await this.tableVideosCollection.updateOne(
          {
            tid: filter.tableId,
            vid: filter.videoId,
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
