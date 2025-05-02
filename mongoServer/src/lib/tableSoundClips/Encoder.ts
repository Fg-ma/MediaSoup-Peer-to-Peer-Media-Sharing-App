import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";
import { tableStateEncodingMap } from "../typeConstant";
import { soundClipEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    tableId: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      soundClipInstanceId: string;
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
        [effectType in SoundClipEffectTypes]: boolean;
      };
    }[];
  }): {
    tid: string;
    sid: string;
    n: string;
    m: string;
    s: number[];
    i: {
      siid: string;
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
    }[];
  } {
    const { tableId, soundClipId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      sid: soundClipId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(({ soundClipInstanceId, positioning, effects }) => ({
        siid: soundClipInstanceId,
        p: {
          p: { l: positioning.position.left, t: positioning.position.top },
          s: { x: positioning.scale.x, y: positioning.scale.y },
          r: positioning.rotation,
        },
        e: Object.entries(effects)
          .filter(([, isEnabled]) => isEnabled)
          .map(
            ([effect]) =>
              soundClipEffectEncodingMap[
                effect as keyof typeof soundClipEffectEncodingMap
              ]
          ),
      })),
    };
  }
}

export default Encoder;
