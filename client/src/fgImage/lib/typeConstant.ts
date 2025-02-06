export interface ImageOptions {
  controlsVanishTime?: number;
  closedCaptionsDecoratorColor?: string;
  primaryImageColor?: string;
  initialVolume?: "high" | "low" | "off";
}

export const defaultImageOptions: {
  controlsVanishTime: number;
  closedCaptionsDecoratorColor: string;
  primaryImageColor: string;
  initialVolume: "high" | "low" | "off";
} = {
  controlsVanishTime: 1250,
  closedCaptionsDecoratorColor: "rgba(30, 30, 30, 0.6)",
  primaryImageColor: "#f56114",
  initialVolume: "high",
};
