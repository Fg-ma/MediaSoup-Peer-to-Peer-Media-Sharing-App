import { ContentStateTypes } from "../../../../universal/contentTypeConstant";
import { SoundClipEffectTypes } from "../../../../universal/effectsTypeConstant";
import { stateEncodingMap } from "../typeConstant";
import { soundClipEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData(data: {
    table_id: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
    state: ContentStateTypes[];
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
    const { table_id, soundClipId, filename, mimeType, state, instances } =
      data;

    return {
      tid: table_id,
      sid: soundClipId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => stateEncodingMap[ate]),
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
