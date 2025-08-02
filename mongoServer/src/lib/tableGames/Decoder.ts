import { GameTypes } from "../../../../universal/contentTypeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
    tid: string;
    gid: string;
    gty: string;
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
  }): {
    tableId: string;
    gameId: string;
    gameType: GameTypes;
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
  } => {
    const { tid, gid, gty, p } = data;

    return {
      tableId: tid,
      gameId: gid,
      gameType: gty as GameTypes,
      positioning: {
        position: { top: p.p.t, left: p.p.l },
        scale: { x: p.s.x, y: p.s.y },
        rotation: p.r,
      },
    };
  };
}

export default Decoder;
