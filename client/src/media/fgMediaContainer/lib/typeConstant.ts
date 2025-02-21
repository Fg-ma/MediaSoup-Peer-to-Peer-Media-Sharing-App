export interface MediaContainerOptions {
  controlsVanishTime?: number;
  gradient?: boolean;
  controlsPlacement?: "outside" | "inside";
  resizeType?: "aspect" | "any";
}

export const defaultMediaContainerOptions: {
  controlsVanishTime: number;
  gradient: boolean;
  controlsPlacement: "outside" | "inside";
  resizeType: "aspect" | "any";
} = {
  controlsVanishTime: 1250,
  gradient: true,
  controlsPlacement: "inside",
  resizeType: "aspect",
};
