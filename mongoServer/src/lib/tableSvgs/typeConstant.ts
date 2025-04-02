export type SvgEffectStylesType = {
  shadow: {
    shadowColor: string;
    strength: number;
    offsetX: number;
    offsetY: number;
  };
  blur: {
    strength: number;
  };
  grayscale: {
    scale: number;
  };
  saturate: {
    saturation: number;
  };
  edgeDetection: {};
  colorOverlay: {
    overlayColor: string;
  };
  waveDistortion: {
    frequency: number;
    strength: number;
  };
  crackedGlass: {
    density: number;
    detail: number;
    strength: number;
  };
  neonGlow: {
    neonColor: string;
  };
};
