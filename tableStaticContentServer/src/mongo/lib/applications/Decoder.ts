import { postProcessEffectDecodingMap } from "../typeConstant";
import {
  applicationEffectEncodingMap,
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
    };
  }): {
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
  } => {
    const { tid, aid, n, m, p, e, es } = data;

    const effects: { [effectType in ApplicationEffectTypes]: boolean } =
      Object.keys(applicationEffectEncodingMap).reduce((acc, key) => {
        acc[key as ApplicationEffectTypes] = e.includes(parseInt(key));
        return acc;
      }, {} as { [effectType in ApplicationEffectTypes]: boolean });

    return {
      table_id: tid,
      applicationId: aid,
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
