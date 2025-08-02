import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { tableStateDecodingMap } from "../typeConstant";
import { svgEffectEncodingMap } from "./typeConstant";

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
      es: {
        "0": {
          c: string;
          s: number;
          x: number;
          y: number;
        };
        "1": {
          s: number;
        };
        "2": {
          s: number;
        };
        "3": {
          s: number;
        };
        "4": {
          c: string;
        };
        "5": {
          f: number;
          s: number;
        };
        "6": {
          n: number;
          d: number;
          s: number;
        };
        "7": {
          c: string;
        };
      };
    }[];
  }): {
    tableId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      svgInstanceId: string;
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
        [effectType in SvgEffectTypes]: boolean;
      };
      effectStyles: SvgEffectStylesType;
    }[];
  } => {
    const { tid, sid, n, m, s, i } = data;

    return {
      tableId: tid,
      svgId: sid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => tableStateDecodingMap[ate]),
      instances: i.map(({ siid, p, e, es }) => ({
        svgInstanceId: siid,
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
          Object.keys(svgEffectEncodingMap).map((key) => [
            key,
            e.includes(svgEffectEncodingMap[key as SvgEffectTypes]),
          ])
        ) as Record<SvgEffectTypes, boolean>,
        effectStyles: {
          shadow: {
            shadowColor: es[0].c,
            strength: es[0].s,
            offsetX: es[0].x,
            offsetY: es[0].y,
          },
          blur: {
            strength: es[1].s,
          },
          grayscale: {
            scale: es[2].s,
          },
          saturate: {
            saturation: es[3].s,
          },
          colorOverlay: {
            overlayColor: es[4].c,
          },
          waveDistortion: {
            frequency: es[5].f,
            strength: es[5].s,
          },
          crackedGlass: {
            density: es[6].n,
            detail: es[6].d,
            strength: es[6].s,
          },
          neonGlow: {
            neonColor: es[7].c,
          },
        },
      })),
    };
  };
}

export default Decoder;
