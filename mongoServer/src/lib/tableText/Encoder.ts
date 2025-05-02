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
    }[];
  } {
    const { tableId, textId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      xid: textId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(({ textInstanceId, positioning }) => ({
        xiid: textInstanceId,
        p: {
          p: { l: positioning.position.left, t: positioning.position.top },
          s: { x: positioning.scale.x, y: positioning.scale.y },
          r: positioning.rotation,
        },
      })),
    };
  }
}

export default Encoder;
