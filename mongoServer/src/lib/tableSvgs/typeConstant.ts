export interface TableSvgsType {
  tid: string;
  sid: string;
  m: string;
  n: string;
  t: boolean;
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
    es: {
      "0": { c: string; s: number; x: number; y: number };
      "1": { s: number };
      "2": { s: number };
      "3": { s: number };
      "4": { c: string };
      "5": { f: number; s: number };
      "6": { n: number; d: number; s: number };
      "7": { c: string };
    };
  }[];
}

export const svgEffectEncodingMap = {
  shadow: 0,
  blur: 1,
  grayscale: 2,
  saturate: 3,
  colorOverlay: 4,
  waveDistortion: 5,
  crackedGlass: 6,
  neonGlow: 7,
  edgeDetection: 8,
};

export const svgEffectStylesEncodingMap = {
  shadow: 0,
  blur: 1,
  grayscale: 2,
  saturate: 3,
  colorOverlay: 4,
  waveDistortion: 5,
  crackedGlass: 6,
  neonGlow: 7,
};
