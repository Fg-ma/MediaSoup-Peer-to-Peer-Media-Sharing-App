import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap } from "./typeConstant";

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
    v: boolean;
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
  }): {
    table_id: string;
    svgId: string;
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
    visible: boolean;
    effects: {
      [effectType in SvgEffectTypes]: boolean;
    };
    effectStyles: SvgEffectStylesType;
  } => {
    const { tid, sid, n, m, p, v, e, es } = data;

    const effects = Object.keys(svgEffectEncodingMap).reduce((acc, key) => {
      const value = svgEffectEncodingMap[key as SvgEffectTypes];
      acc[key as SvgEffectTypes] = e.includes(value);
      return acc;
    }, {} as Record<SvgEffectTypes, boolean>);

    return {
      table_id: tid,
      svgId: sid,
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
      visible: v,
      effects,
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
    };
  };
}

export default Decoder;
