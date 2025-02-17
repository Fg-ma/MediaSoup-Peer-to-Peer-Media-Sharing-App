import { postProcessEffectEncodingMap } from "../typeConstant";
import {
  textEffectEncodingMap,
  TextEffectStylesType,
  TextEffectTypes,
} from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    textId: string;
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
      [effectType in TextEffectTypes]: boolean;
    };
    effectStyles: TextEffectStylesType;
  }): {
    tid: string;
    xid: string;
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
      textId,
      filename,
      mimeType,
      positioning,
      effects,
      effectStyles,
    } = data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => textEffectEncodingMap[effect as keyof typeof effects]);

    return {
      tid: table_id,
      xid: textId,
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
