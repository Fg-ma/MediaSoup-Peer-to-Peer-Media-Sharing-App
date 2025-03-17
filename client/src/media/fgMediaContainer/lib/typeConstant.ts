export interface MediaContainerOptions {
  controlsVanishTime?: number;
  gradient?: boolean;
  controlsPlacement?: "outside" | "inside";
  resizeType?: "aspect" | "any";
  adjustmentAnimation?: boolean;
}

export const defaultMediaContainerOptions: {
  controlsVanishTime: number;
  gradient: boolean;
  controlsPlacement: "outside" | "inside";
  resizeType: "aspect" | "any";
  adjustmentAnimation: boolean;
} = {
  controlsVanishTime: 1250,
  gradient: true,
  controlsPlacement: "inside",
  resizeType: "aspect",
  adjustmentAnimation: true,
};
