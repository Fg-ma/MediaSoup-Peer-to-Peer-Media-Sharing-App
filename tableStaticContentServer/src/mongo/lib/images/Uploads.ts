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
import {
  imageEffectEncodingMap,
  ImageEffectStylesType,
  ImageEffectTypes,
} from "./typeConstant";

class Uploads {
  constructor(
    private tableImagesCollection: Collection,
    private encoder: Encoder
  ) {}

  uploadMetaData = async (data: {
    table_id: string;
    imageId: string;
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
    effects: {
      [effectType in ImageEffectTypes]: boolean;
    };
    effectStyles: ImageEffectStylesType;
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
      positioning?: {
        position?: { left?: number; top?: number };
        scale?: { x?: number; y?: number };
        rotation?: number;
      };
      effects?: { [effectType in ImageEffectTypes]?: boolean };
      effectStyles?: ImageEffectStylesType;
    }>
  ) => {
    if (!this.tableImagesCollection) {
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

    if (updateData.effects) {
      updateFields["e"] = Object.keys(updateData.effects)
        .filter(
          (effect) =>
            updateData.effects?.[effect as keyof typeof updateData.effects]
        )
        .map(
          (effect) =>
            imageEffectEncodingMap[effect as keyof typeof updateData.effects]
        );
    }

    if (updateData.effectStyles) {
      updateFields["es"] = {
        "0": {
          s: postProcessEffectEncodingMap[
            updateData.effectStyles.postProcess.style
          ],
        },
        "1": {
          s: hideBackgroundEffectEncodingMap[
            updateData.effectStyles.hideBackground.style
          ],
          c: updateData.effectStyles.hideBackground.color,
        },
        "2": {
          c: updateData.effectStyles.tint.color,
        },
        "3": {
          s: glassesEffectEncodingMap[updateData.effectStyles.glasses.style],
        },
        "4": {
          s: beardsEffectEncodingMap[updateData.effectStyles.beards.style],
        },
        "5": {
          s: mustachesEffectEncodingMap[
            updateData.effectStyles.mustaches.style
          ],
        },
        "6": { s: masksEffectEncodingMap[updateData.effectStyles.masks.style] },
        "7": { s: hatsEffectEncodingMap[updateData.effectStyles.hats.style] },
        "8": { s: petsEffectEncodingMap[updateData.effectStyles.pets.style] },
      };
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
