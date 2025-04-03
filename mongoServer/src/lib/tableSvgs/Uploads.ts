import { Collection } from "mongodb";
import Encoder from "./Encoder";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap } from "./typeConstant";

class Uploads {
  constructor(
    private tableSvgsCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
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
    visible: boolean;
    effects: {
      [effectType in SvgEffectTypes]: boolean;
    };
    effectStyles: SvgEffectStylesType;
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
      positioning?: {
        position?: { left?: number; top?: number };
        scale?: { x?: number; y?: number };
        rotation?: number;
      };
      filename?: string;
      mimeType?: string;
      visible?: boolean;
      effects?: { [effectType in SvgEffectTypes]?: boolean };
      effectStyles?: SvgEffectStylesType;
    }>
  ) => {
    if (!this.tableSvgsCollection) {
      console.error("Database not connected");
      return;
    }

    const updateFields: any = {};

    if (updateData.positioning) {
      if (updateData.positioning.position) {
        if (updateData.positioning.position.left !== undefined) {
          updateFields["p.p.l"] = updateData.positioning.position.left;
        }
        if (updateData.positioning.position.top !== undefined) {
          updateFields["p.p.t"] = updateData.positioning.position.top;
        }
      }
      if (updateData.positioning.scale) {
        if (updateData.positioning.scale.x !== undefined) {
          updateFields["p.s.x"] = updateData.positioning.scale.x;
        }
        if (updateData.positioning.scale.y !== undefined) {
          updateFields["p.s.y"] = updateData.positioning.scale.y;
        }
      }
      if (updateData.positioning.rotation !== undefined) {
        updateFields["p.r"] = updateData.positioning.rotation;
      }
    }

    if (updateData.filename) {
      updateFields["n"] = updateData.filename;
    }

    if (updateData.mimeType) {
      updateFields["m"] = updateData.mimeType;
    }

    if (updateData.visible) {
      updateFields["v"] = updateData.visible;
    }

    if (updateData.effects) {
      updateFields["e"] = Object.keys(updateData.effects)
        .filter(
          (effect) =>
            updateData.effects?.[effect as keyof typeof updateData.effects]
        )
        .map(
          (effect) =>
            svgEffectEncodingMap[effect as keyof typeof updateData.effects]
        );
    }

    if (updateData.effectStyles) {
      updateFields["es"] = {
        "0": {
          c: updateData.effectStyles.shadow.shadowColor,
          s: updateData.effectStyles.shadow.strength,
          x: updateData.effectStyles.shadow.offsetX,
          y: updateData.effectStyles.shadow.offsetY,
        },
        "1": {
          s: updateData.effectStyles.blur.strength,
        },
        "2": {
          s: updateData.effectStyles.grayscale.scale,
        },
        "3": {
          s: updateData.effectStyles.saturate.saturation,
        },
        "4": {
          c: updateData.effectStyles.colorOverlay.overlayColor,
        },
        "5": {
          f: updateData.effectStyles.waveDistortion.frequency,
          s: updateData.effectStyles.waveDistortion.strength,
        },
        "6": {
          n: updateData.effectStyles.crackedGlass.density,
          d: updateData.effectStyles.crackedGlass.detail,
          s: updateData.effectStyles.crackedGlass.strength,
        },
        "7": {
          c: updateData.effectStyles.neonGlow.neonColor,
        },
      };
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
