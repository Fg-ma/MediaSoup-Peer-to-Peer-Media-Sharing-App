import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { tableStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
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
  }): {
    tableId: string;
    textId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
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
      effectStyles: {
        backgroundColor: string;
        textColor: string;
        indexColor: string;
        fontSize: string;
        fontStyle: string;
        letterSpacing: number;
      };
    }[];
  } => {
    const { tid, xid, n, m, s, i } = data;

    return {
      tableId: tid,
      textId: xid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => tableStateDecodingMap[ate]),
      instances: i.map(({ xiid, p, es }) => ({
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
        effectStyles: {
          backgroundColor: es["0"],
          textColor: es["1"],
          indexColor: es["2"],
          fontSize: es["3"],
          fontStyle: es["4"],
          letterSpacing: es["5"],
        },
      })),
    };
  };
}

export default Decoder;
