import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  beardsEffectEncodingMap,
  glassesEffectEncodingMap,
  hatsEffectEncodingMap,
  hideBackgroundEffectEncodingMap,
  masksEffectEncodingMap,
  mustachesEffectEncodingMap,
  petsEffectEncodingMap,
  postProcessEffectEncodingMap,
  tableStateEncodingMap,
} from "../typeConstant";
import { videoEffectEncodingMap } from "./typeConstant";

class Encoder {
  constructor() {}

  encodeMetadata(data: {
    tableId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      videoInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
      effects: {
        [effectType in VideoEffectTypes]: boolean;
      };
      effectStyles: VideoEffectStylesType;
      meta: {
        isPlaying: boolean;
        lastKnownPosition: number;
        videoPlaybackSpeed: number;
        ended: boolean;
      };
    }[];
  }): {
    tid: string;
    vid: string;
    n: string;
    m: string;
    s: number[];
    i: {
      viid: string;
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
      es: {
        "0": {
          s: number;
        };
        "1": {
          s: number;
          c: string;
        };
        "2": {
          c: string;
        };
        "3": {
          s: number;
        };
        "4": {
          s: number;
        };
        "5": {
          s: number;
        };
        "6": {
          s: number;
        };
        "7": {
          s: number;
        };
        "8": {
          s: number;
        };
      };
      m: {
        ip: boolean;
        lkp: number;
        vps: number;
        e: boolean;
      };
    }[];
  } {
    const { tableId, videoId, filename, mimeType, state, instances } = data;

    return {
      tid: tableId,
      vid: videoId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => tableStateEncodingMap[ate]),
      i: instances.map(
        ({ videoInstanceId, positioning, effects, effectStyles, meta }) => ({
          viid: videoInstanceId,
          p: {
            p: { l: positioning.position.left, t: positioning.position.top },
            s: { x: positioning.scale.x, y: positioning.scale.y },
            r: positioning.rotation,
          },
          e: Object.entries(effects)
            .filter(([, isEnabled]) => isEnabled)
            .map(
              ([effect]) =>
                videoEffectEncodingMap[
                  effect as keyof typeof videoEffectEncodingMap
                ]
            ),
          es: {
            "0": {
              s: postProcessEffectEncodingMap[effectStyles.postProcess.style],
            },
            "1": {
              s: hideBackgroundEffectEncodingMap[
                effectStyles.hideBackground.style
              ],
              c: effectStyles.hideBackground.color,
            },
            "2": {
              c: effectStyles.tint.color,
            },
            "3": {
              s: glassesEffectEncodingMap[effectStyles.glasses.style],
            },
            "4": {
              s: beardsEffectEncodingMap[effectStyles.beards.style],
            },
            "5": {
              s: mustachesEffectEncodingMap[effectStyles.mustaches.style],
            },
            "6": {
              s: masksEffectEncodingMap[effectStyles.masks.style],
            },
            "7": {
              s: hatsEffectEncodingMap[effectStyles.hats.style],
            },
            "8": {
              s: petsEffectEncodingMap[effectStyles.pets.style],
            },
          },
          m: {
            ip: meta.isPlaying,
            lkp: meta.lastKnownPosition,
            vps: meta.videoPlaybackSpeed,
            e: meta.ended,
          },
        })
      ),
    };
  }
}

export default Encoder;
