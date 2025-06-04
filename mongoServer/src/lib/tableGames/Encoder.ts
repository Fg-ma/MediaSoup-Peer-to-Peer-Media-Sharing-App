import { GameTypes } from "../../../../universal/contentTypeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
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
  }): {
    tid: string;
    gid: string;
    gty: GameTypes;
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
  } {
    const { tableId, gameId, gameType, positioning } = data;

    return {
      tid: tableId,
      gid: gameId,
      gty: gameType,
      p: {
        p: { l: positioning.position.left, t: positioning.position.top },
        s: { x: positioning.scale.x, y: positioning.scale.y },
        r: positioning.rotation,
      },
    };
  }
}

export default Encoder;
