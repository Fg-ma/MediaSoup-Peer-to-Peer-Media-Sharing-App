import { audioEffectEncodingMap, AudioEffectTypes } from "./typeConstant";

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
  }): {
    table_id: string;
    audioId: string;
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
      [effectType in AudioEffectTypes]: boolean;
    };
  } => {
    const { tid, aid, n, m, p, e } = data;

    const effects: { [effectType in AudioEffectTypes]: boolean } = Object.keys(
      audioEffectEncodingMap
    ).reduce((acc, key) => {
      acc[key as AudioEffectTypes] = e.includes(parseInt(key));
      return acc;
    }, {} as { [effectType in AudioEffectTypes]: boolean });

    return {
      table_id: tid,
      audioId: aid,
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
    };
  };
}

export default Decoder;
