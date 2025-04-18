import { ContentStateTypes } from "../../../../universal/contentTypeConstant";
import { stateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    table_id: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: ContentStateTypes[];
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
    const { table_id, textId, filename, mimeType, state, instances } = data;

    return {
      tid: table_id,
      xid: textId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => stateEncodingMap[ate]),
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
