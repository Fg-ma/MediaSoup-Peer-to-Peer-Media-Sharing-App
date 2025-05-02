import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  ImageEffectStylesType,
  ImageEffectTypes,
} from "../../../../universal/effectsTypeConstant";
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
import { imageEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    tableId: string;
    imageId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
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
  }): {
    tid: string;
    iid: string;
    n: string;
    m: string;
    s: number[];
    i: {
      iiid: string;
      p: {
        p: {
          l: number;
          t: number;
        };
        s: {
          x: number;
          y: number;
        };
        r: number;
      };
      e: number[];
      es: {
        "0": {
          s: number;
        };
        "1": {
          s: number;
          c: string;
        };
        "2": {
          c: string;
        };
        "3": {
          s: number;
        };
        "4": {
          s: number;
        };
        "5": {
          s: number;
        };
        "6": {
          s: number;
        };
        "7": {
          s: number;
        };
        "8": {
          s: number;
        };
      };
    }[];
  } {
    const { tableId, imageId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      iid: imageId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(
        ({ imageInstanceId, positioning, effects, effectStyles }) => ({
          iiid: imageInstanceId,
          p: {
            p: { l: positioning.position.left, t: positioning.position.top },
            s: { x: positioning.scale.x, y: positioning.scale.y },
            r: positioning.rotation,
          },
          e: Object.entries(effects)
            .filter(([, isEnabled]) => isEnabled)
            .map(
              ([effect]) =>
                imageEffectEncodingMap[
                  effect as keyof typeof imageEffectEncodingMap
                ]
            ),
          es: {
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
          },
        })
      ),
    };
  }
}

export default Encoder;
