export interface MediaContainerOptions {
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
  primaryMediaColor?: string;
}

export const defaultMediaContainerOptions: {
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryMediaColor: string;
} = {
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryMediaColor: "#f56114",
};
