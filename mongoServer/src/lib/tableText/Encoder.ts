import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { tableStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    tableId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      textInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effectStyles: {
        backgroundColor: string;
        textColor: string;
        indexColor: string;
        fontSize: string;
        fontStyle: string;
        letterSpacing: number;
      };
    }[];
  }): {
    tid: string;
    xid: string;
    n: string;
    m: string;
    s: number[];
    i: {
      xiid: string;
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
      es: {
        "0": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": number;
      };
    }[];
  } {
    const { tableId, textId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      xid: textId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(({ textInstanceId, positioning, effectStyles }) => ({
        xiid: textInstanceId,
        p: {
          p: { l: positioning.position.left, t: positioning.position.top },
          s: { x: positioning.scale.x, y: positioning.scale.y },
          r: positioning.rotation,
        },
        es: {
          "0": effectStyles.backgroundColor,
          "1": effectStyles.textColor,
          "2": effectStyles.indexColor,
          "3": effectStyles.fontSize,
          "4": effectStyles.fontStyle,
          "5": effectStyles.letterSpacing,
        },
      })),
    };
  }
}

export default Encoder;
