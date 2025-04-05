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
          filter: { tid: filter.table_id, sid: filter.soundClipId },
          update: { $set: generalSetFields },
        },
      });
    }

    // 2. Instance updates
    if (updateData.instances && updateData.instances.length > 0) {
      for (const { siid, positioning, effects } of updateData.instances) {
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
              (effect) =>
                soundClipEffectEncodingMap[effect as keyof typeof effects]
            );

          instanceSetFields["i.$.e"] = effectValues;
        }

        if (Object.keys(instanceSetFields).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: {
                tid: filter.table_id,
                sid: filter.soundClipId,
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
        const result = await this.tableSoundClipsCollection.bulkWrite(bulkOps);
        return result;
      } catch (err) {
        console.error("Bulk write error:", err);
      }
    }
  };
}

export default Uploads;
