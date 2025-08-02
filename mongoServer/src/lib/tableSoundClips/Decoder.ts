import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";
import { tableStateDecodingMap } from "../typeConstant";
import { soundClipEffectEncodingMap } from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
    tid: string;
    sid: string;
    n: string;
    m: string;
    s: number[];
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
    tableId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
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
    const { tid, sid, n, m, s, i } = data;

    return {
      tableId: tid,
      svgId: sid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => tableStateDecodingMap[ate]),
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
