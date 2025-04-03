import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { postProcessEffectEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    applicationId: string;
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
      [effectType in ApplicationEffectTypes]: boolean;
    };
    effectStyles: ApplicationEffectStylesType;
  }): {
    tid: string;
    aid: string;
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
        c: string;
      };
    };
  } => {
    const {
      table_id,
      applicationId,
      filename,
      mimeType,
      positioning,
      effects,
      effectStyles,
    } = data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => parseInt(effect));

    return {
      tid: table_id,
      aid: applicationId,
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
          c: effectStyles.tint.color,
        },
      },
    };
  };
}

export default Encoder;
