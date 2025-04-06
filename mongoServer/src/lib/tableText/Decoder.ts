import { ContentStateTypes } from "../../../../universal/contentTypeConstant";
import { stateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
  }): {
    table_id: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: ContentStateTypes[];
    instances: {
      textInstanceId: string;
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
    }[];
  } => {
    const { tid, xid, n, m, s, i } = data;

    return {
      table_id: tid,
      textId: xid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => stateDecodingMap[ate]),
      instances: i.map(({ xiid, p }) => ({
        textInstanceId: xiid,
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
      })),
    };
  };
}

export default Decoder;
