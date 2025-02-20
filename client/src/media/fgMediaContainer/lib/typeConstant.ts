export interface MediaContainerOptions {
  controlsVanishTime?: number;
  gradient?: boolean;
  controlsPlacement?: "outside" | "inside";
}

export const defaultMediaContainerOptions: {
  controlsVanishTime: number;
  gradient: boolean;
  controlsPlacement: "outside" | "inside";
} = {
  controlsVanishTime: 1250,
  gradient: true,
  controlsPlacement: "inside",
};
