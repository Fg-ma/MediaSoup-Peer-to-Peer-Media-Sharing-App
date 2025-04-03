import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { svgEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
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
  }): {
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
  } => {
    const {
      table_id,
      svgId,
      filename,
      mimeType,
      positioning,
      visible,
      effects,
      effectStyles,
    } = data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => svgEffectEncodingMap[effect as keyof typeof effects]);

    const es = {
      "0": {
        c: effectStyles.shadow.shadowColor,
        s: effectStyles.shadow.strength,
        x: effectStyles.shadow.offsetX,
        y: effectStyles.shadow.offsetY,
      },
      "1": {
        s: effectStyles.blur.strength,
      },
      "2": {
        s: effectStyles.grayscale.scale,
      },
      "3": {
        s: effectStyles.saturate.saturation,
      },
      "4": {
        c: effectStyles.colorOverlay.overlayColor,
      },
      "5": {
        f: effectStyles.waveDistortion.frequency,
        s: effectStyles.waveDistortion.strength,
      },
      "6": {
        n: effectStyles.crackedGlass.density,
        d: effectStyles.crackedGlass.detail,
        s: effectStyles.crackedGlass.strength,
      },
      "7": {
        c: effectStyles.neonGlow.neonColor,
      },
    };

    return {
      tid: table_id,
      sid: svgId,
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
      v: visible,
      e,
      es,
    };
  };
}

export default Encoder;
