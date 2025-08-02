import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  postProcessEffectDecodingMap,
  tableStateDecodingMap,
} from "../typeConstant";
import { applicationEffectEncodingMap } from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
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
  }): {
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
  } => {
    const { tid, aid, n, m, s, i } = data;

    return {
      tableId: tid,
      applicationId: aid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => tableStateDecodingMap[ate]),
      instances: i.map(({ aiid, p, e, es }) => ({
        applicationInstanceId: aiid,
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
          Object.keys(applicationEffectEncodingMap).map((key) => [
            key,
            e.includes(
              applicationEffectEncodingMap[key as ApplicationEffectTypes]
            ),
          ])
        ) as Record<ApplicationEffectTypes, boolean>,
        effectStyles: {
          postProcess: {
            style: postProcessEffectDecodingMap[es["0"].s],
          },
          tint: {
            color: es["1"].c,
          },
        },
      })),
    };
  };
}

export default Decoder;
