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
import {
  videoEffectEncodingMap,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    videoId: string;
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
      [effectType in VideoEffectTypes]: boolean;
    };
    effectStyles: VideoEffectStylesType;
  }): {
    tid: string;
    vid: string;
    n: string;
    m: string;
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
  } => {
    const {
      table_id,
      videoId,
      filename,
      mimeType,
      positioning,
      effects,
      effectStyles,
    } = data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => videoEffectEncodingMap[effect as keyof typeof effects]);

    return {
      tid: table_id,
      vid: videoId,
      n: filename,
      m: mimeType,
      p: {
        p: {
          l: positioning.position.left,
          t: positioning.position.top,
        },
        s: {
          x: positioning.scale.x,
          y: positioning.scale.y,
        },
        r: positioning.rotation,
      },
      e,
      es: {
        "0": {
          s: postProcessEffectEncodingMap[effectStyles.postProcess.style],
        },
        "1": {
          s: hideBackgroundEffectEncodingMap[effectStyles.hideBackground.style],
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
    };
  };
}

export default Encoder;
