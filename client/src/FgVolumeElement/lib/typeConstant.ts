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

export type FgVolumeElementControllerMessagesType =
  | onClientMuteStateResponsedType
  | onClientMuteChangeType;

export type onClientMuteStateResponsedType = {
  type: "clientMuteStateResponsed";
  data: {
    producerUsername: string;
    producerInstance: string;
  };
};

export type onClientMuteChangeType = {
  type: "clientMuteChange";
  data: {
    username: string;
    clientMute: boolean;
  };
};

export const defaultFgVolumeElementOptions = {
  iconSize: "2.5rem",
  volumeSliderHeight: "0.25rem",
  volumeSliderWidth: "5rem",
  volumeSliderThumbSize: "0.9375rem",
  primaryColor: "white",
  isSlider: true,
  initialVolume: "high",
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};
