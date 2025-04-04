import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";
import { soundClipEffectEncodingMap } from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    tid: string;
    sid: string;
    n: string;
    m: string;
    t: boolean;
    i: {
      siid: string;
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
    }[];
  }): {
    table_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      soundClipInstanceId: string;
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
    }[];
  } => {
    const { tid, sid, n, m, t, i } = data;

    return {
      table_id: tid,
      svgId: sid,
      filename: n,
      mimeType: m,
      tabled: t,
      instances: i.map(({ siid, p, e }) => ({
        soundClipInstanceId: siid,
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
        effects: Object.fromEntries(
          Object.keys(soundClipEffectEncodingMap).map((key) => [
            key,
            e.includes(soundClipEffectEncodingMap[key as SoundClipEffectTypes]),
          ])
        ) as Record<SoundClipEffectTypes, boolean>,
      })),
    };
  };
}

export default Decoder;
