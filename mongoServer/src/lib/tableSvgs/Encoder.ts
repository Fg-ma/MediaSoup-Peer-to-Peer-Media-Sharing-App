import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  SvgEffectStylesType,
  SvgEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { tableStateEncodingMap } from "../typeConstant";
import { svgEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetadata(data: {
    tableId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      svgInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effects: { [effectType in SvgEffectTypes]: boolean };
      effectStyles: SvgEffectStylesType;
    }[];
  }): {
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
  } {
    const { tableId, svgId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      sid: svgId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(
        ({ svgInstanceId, positioning, effects, effectStyles }) => ({
          siid: svgInstanceId,
          p: {
            p: { l: positioning.position.left, t: positioning.position.top },
            s: { x: positioning.scale.x, y: positioning.scale.y },
            r: positioning.rotation,
          },
          e: Object.entries(effects)
            .filter(([, isEnabled]) => isEnabled)
            .map(([effect]) => svgEffectEncodingMap[effect as SvgEffectTypes]),
          es: {
            "0": {
              c: effectStyles.shadow.shadowColor,
              s: effectStyles.shadow.strength,
              x: effectStyles.shadow.offsetX,
              y: effectStyles.shadow.offsetY,
            },
            "1": { s: effectStyles.blur.strength },
            "2": { s: effectStyles.grayscale.scale },
            "3": { s: effectStyles.saturate.saturation },
            "4": { c: effectStyles.colorOverlay.overlayColor },
            "5": {
              f: effectStyles.waveDistortion.frequency,
              s: effectStyles.waveDistortion.strength,
            },
            "6": {
              n: effectStyles.crackedGlass.density,
              d: effectStyles.crackedGlass.detail,
              s: effectStyles.crackedGlass.strength,
            },
            "7": { c: effectStyles.neonGlow.neonColor },
          },
        })
      ),
    };
  }
}

export default Encoder;
