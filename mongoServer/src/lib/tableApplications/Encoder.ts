import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  postProcessEffectEncodingMap,
  tableStateEncodingMap,
} from "../typeConstant";
import { applicationEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    tableId: string;
    applicationId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      applicationInstanceId: string;
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
    }[];
  }): {
    tid: string;
    aid: string;
    n: string;
    m: string;
    s: number[];
    i: {
      aiid: string;
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
          c: string;
        };
      };
    }[];
  } {
    const { tableId, applicationId, filename, mimeType, state, instances } =
      data;

    return {
      tid: tableId,
      aid: applicationId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(
        ({ applicationInstanceId, positioning, effects, effectStyles }) => ({
          aiid: applicationInstanceId,
          p: {
            p: { l: positioning.position.left, t: positioning.position.top },
            s: { x: positioning.scale.x, y: positioning.scale.y },
            r: positioning.rotation,
          },
          e: Object.entries(effects)
            .filter(([, isEnabled]) => isEnabled)
            .map(
              ([effect]) =>
                applicationEffectEncodingMap[
                  effect as keyof typeof applicationEffectEncodingMap
                ]
            ),
          es: {
            "0": {
              s: postProcessEffectEncodingMap[effectStyles.postProcess.style],
            },
            "1": {
              c: effectStyles.tint.color,
            },
          },
        })
      ),
    };
  }
}

export default Encoder;
