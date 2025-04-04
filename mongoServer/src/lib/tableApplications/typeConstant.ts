export interface TableApplicationsType {
  tid: string;
  aid: string;
  m: string;
  n: string;
  t: boolean;
  i: {
    aiid: string;
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
        c: string;
      };
    };
  }[];
}

export const applicationEffectEncodingMap = {
  postProcess: 0,
  blur: 1,
  tint: 2,
};

export const applicationEffectStylesEncodingMap = {
  postProcess: 0,
  tint: 1,
};
