import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";
import { soundClipEffectEncodingMap } from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    tid: string;
    sid: string;
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
    soundClipId: string;
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
      [effectType in SoundClipEffectTypes]: boolean;
    };
  } => {
    const { tid, sid, n, m, p, e } = data;

    const effects = Object.keys(soundClipEffectEncodingMap).reduce(
      (acc, key) => {
        const value = soundClipEffectEncodingMap[key as SoundClipEffectTypes];
        acc[key as SoundClipEffectTypes] = e.includes(value);
        return acc;
      },
      {} as Record<SoundClipEffectTypes, boolean>
    );

    return {
      table_id: tid,
      soundClipId: sid,
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
