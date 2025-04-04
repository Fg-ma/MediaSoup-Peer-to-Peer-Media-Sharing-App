import { Collection } from "mongodb";
import Encoder from "./Encoder";
import {
  soundClipEffectEncodingMap,
  TableSoundClipsType,
} from "./typeConstant";
import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";

class Uploads {
  constructor(
    private tableSoundClipsCollection: Collection<TableSoundClipsType>,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      soundClipInstanceId: string;
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
        [effectType in SoundClipEffectTypes]: boolean;
      };
    }[];
  }) => {
    const mongoData = this.encoder.encodeMetaData(data);

    try {
      await this.tableSoundClipsCollection?.insertOne(mongoData);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  editMetaData = async (
    filter: { table_id: string; soundClipId: string },
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
        effects?: { [effectType in SoundClipEffectTypes]?: boolean };
      }[];
    }>
  ) => {
    if (!this.tableSoundClipsCollection) {
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
      updateData.instances.forEach(({ siid, positioning, effects }) => {
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
                  soundClipEffectEncodingMap[effect as keyof typeof effects]
              );

            instanceUpdate["i.$.e"] = effectValues;
          }
        }

        if (Object.keys(instanceUpdate).length > 0) {
          updateFields["$set"] = instanceUpdate;
        }
      });
    }

    try {
      const result = await this.tableSoundClipsCollection.updateOne(
        { tid: filter.table_id, sid: filter.soundClipId },
        { $set: updateFields }
      );
      return result;
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
}

export default Uploads;
