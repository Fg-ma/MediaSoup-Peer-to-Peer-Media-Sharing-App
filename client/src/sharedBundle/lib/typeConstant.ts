import { Permissions } from "../../context/permissionsContext/typeConstant";

export interface BundleOptions {
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  initialVolume?: "off" | "low" | "high";
  permissions?: Permissions;
}

export const defaultBundleOptions = {
  primaryVolumeSliderColor: "#f2f2f2",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};
