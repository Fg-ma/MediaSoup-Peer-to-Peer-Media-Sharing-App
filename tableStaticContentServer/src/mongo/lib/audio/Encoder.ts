import { audioEffectEncodingMap, AudioEffectTypes } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    audioId: string;
    filename: string;
    mimeType: string;
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
      [effectType in AudioEffectTypes]: boolean;
    };
  }): {
    tid: string;
    aid: string;
    n: string;
    m: string;
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
  } => {
    const { table_id, audioId, filename, mimeType, positioning, effects } =
      data;

    const e: number[] = Object.keys(effects)
      .filter((effect) => effects[effect as keyof typeof effects])
      .map((effect) => audioEffectEncodingMap[effect as keyof typeof effects]);

    return {
      tid: table_id,
      aid: audioId,
      n: filename,
      m: mimeType,
      p: {
        p: {
          l: positioning.position.left,
          t: positioning.position.top,
        },
        s: {
          x: positioning.scale.x,
          y: positioning.scale.y,
        },
        r: positioning.rotation,
      },
      e,
    };
  };
}

export default Encoder;
