import {
  beardsEffectDecodingMap,
  glassesEffectDecodingMap,
  hatsEffectDecodingMap,
  hideBackgroundEffectDecodingMap,
  masksEffectDecodingMap,
  mustachesEffectDecodingMap,
  petsEffectDecodingMap,
  postProcessEffectDecodingMap,
} from "../typeConstant";
import {
  imageEffectStylesEncodingMap,
  ImageEffectStylesType,
  ImageEffectTypes,
} from "./typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    tid: string;
    iid: string;
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
        s: number;
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
    };
  }): {
    table_id: string;
    imageId: string;
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
      [effectType in ImageEffectTypes]: boolean;
    };
    effectStyles: ImageEffectStylesType;
  } => {
    const { tid, iid, p, e, es } = data;

    const effects: { [effectType in ImageEffectTypes]: boolean } = Object.keys(
      imageEffectStylesEncodingMap
    ).reduce((acc, key) => {
      acc[key as ImageEffectTypes] = e.includes(parseInt(key));
      return acc;
    }, {} as { [effectType in ImageEffectTypes]: boolean });

    return {
      table_id: tid,
      imageId: iid,
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
      effects,
      effectStyles: {
        postProcess: {
          style: postProcessEffectDecodingMap[es["0"].s],
        },
        hideBackground: {
          style: hideBackgroundEffectDecodingMap[es["1"].s],
          color: es["1"].c,
        },
        glasses: {
          style: glassesEffectDecodingMap[es["2"].s],
        },
        beards: {
          style: beardsEffectDecodingMap[es["3"].s],
        },
        mustaches: {
          style: mustachesEffectDecodingMap[es["4"].s],
        },
        masks: {
          style: masksEffectDecodingMap[es["5"].s],
        },
        hats: {
          style: hatsEffectDecodingMap[es["6"].s],
        },
        pets: {
          style: petsEffectDecodingMap[es["7"].s],
        },
      },
    };
  };
}

export default Decoder;
