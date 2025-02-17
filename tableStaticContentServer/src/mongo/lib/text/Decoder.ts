import { postProcessEffectDecodingMap } from "../typeConstant";
import {
  textEffectEncodingMap,
  TextEffectStylesType,
  TextEffectTypes,
} from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
        s: number;
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
    };
  }): {
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
  } => {
    const { tid, vid, n, m, p, e, es } = data;

    const effects = Object.keys(textEffectEncodingMap).reduce((acc, key) => {
      const value = textEffectEncodingMap[key as TextEffectTypes];
      acc[key as TextEffectTypes] = e.includes(value);
      return acc;
    }, {} as Record<TextEffectTypes, boolean>);

    return {
      table_id: tid,
      textId: vid,
      filename: n,
      mimeType: m,
      positioning: {
        position: {
          left: p.p.l,
          top: p.p.t,
        },
        scale: {
          x: p.s.x,
          y: p.s.y,
        },
        rotation: p.r,
      },
      effects,
      effectStyles: {
        postProcess: {
          style: postProcessEffectDecodingMap[es["0"].s],
        },
      },
    };
  };
}

export default Decoder;
