import { TableContentStateTypes } from "../../../../universal/contentTypeConstant";
import {
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import {
  beardsEffectDecodingMap,
  glassesEffectDecodingMap,
  hatsEffectDecodingMap,
  hideBackgroundEffectDecodingMap,
  masksEffectDecodingMap,
  mustachesEffectDecodingMap,
  petsEffectDecodingMap,
  postProcessEffectDecodingMap,
  tableStateDecodingMap,
} from "../typeConstant";
import { videoEffectEncodingMap } from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
      };
    }[];
  }): {
    tableId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: TableContentStateTypes[];
    instances: {
      videoInstanceId: string;
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
        [effectType in VideoEffectTypes]: boolean;
      };
      effectStyles: VideoEffectStylesType;
      meta: {
        isPlaying: boolean;
        lastKnownPosition: number;
        videoPlaybackSpeed: number;
      };
    }[];
  } => {
    const { tid, vid, n, m, s, i } = data;

    return {
      tableId: tid,
      videoId: vid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => tableStateDecodingMap[ate]),
      instances: i.map(({ viid, p, e, es, m }) => ({
        videoInstanceId: viid,
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
        effects: Object.fromEntries(
          Object.keys(videoEffectEncodingMap).map((key) => [
            key,
            e.includes(videoEffectEncodingMap[key as VideoEffectTypes]),
          ])
        ) as Record<VideoEffectTypes, boolean>,
        effectStyles: {
          postProcess: {
            style: postProcessEffectDecodingMap[es["0"].s],
          },
          hideBackground: {
            style: hideBackgroundEffectDecodingMap[es["1"].s],
            color: es["1"].c,
          },
          tint: {
            color: es["2"].c,
          },
          glasses: {
            style: glassesEffectDecodingMap[es["3"].s],
          },
          beards: {
            style: beardsEffectDecodingMap[es["4"].s],
          },
          mustaches: {
            style: mustachesEffectDecodingMap[es["5"].s],
          },
          masks: {
            style: masksEffectDecodingMap[es["6"].s],
          },
          hats: {
            style: hatsEffectDecodingMap[es["7"].s],
          },
          pets: {
            style: petsEffectDecodingMap[es["8"].s],
          },
        },
        meta: {
          isPlaying: m.ip,
          lastKnownPosition: m.lkp,
          videoPlaybackSpeed: m.vps,
        },
      })),
    };
  };
}

export default Decoder;
