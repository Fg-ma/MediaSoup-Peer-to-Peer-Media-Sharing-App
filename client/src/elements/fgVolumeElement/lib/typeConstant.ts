export interface FgVolumeElementOptions {
  iconSize?: string;
  volumeSliderHeight?: string;
  volumeSliderWidth?: string;
  volumeSliderThumbSize?: string;
  primaryColor?: string;
  isSlider?: boolean;
  initialVolume?: string;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
}

export const defaultFgVolumeElementOptions = {
  iconSize: "2.5rem",
  volumeSliderHeight: "0.25rem",
  volumeSliderWidth: "5rem",
  volumeSliderThumbSize: "0.9375rem",
  primaryColor: "#f2f2f2",
  isSlider: true,
  initialVolume: "high",
  primaryVolumeSliderColor: "#f2f2f2",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};
