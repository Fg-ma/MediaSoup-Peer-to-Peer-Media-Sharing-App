import { ImageEffectTypes } from "../../../../universal/effectsTypeConstant";

export interface TableImagesType {
  tid: string;
  iid: string;
  m: string;
  n: string;
  s: number[];
  i: {
    iiid: string;
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
  }[];
}

export const imageEffectEncodingMap: Record<ImageEffectTypes, number> = {
  postProcess: 0,
  hideBackground: 1,
  blur: 2,
  tint: 3,
  glasses: 4,
  beards: 5,
  mustaches: 6,
  masks: 7,
  hats: 8,
  pets: 9,
};

export const imageEffectStylesEncodingMap: Partial<
  Record<ImageEffectTypes, number>
> = {
  postProcess: 0,
  hideBackground: 1,
  tint: 2,
  glasses: 3,
  beards: 4,
  mustaches: 5,
  masks: 6,
  hats: 7,
  pets: 8,
};
