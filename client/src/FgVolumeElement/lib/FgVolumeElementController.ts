import { FgVolumeElementOptions } from "../FgVolumeElement";
import FgVolumeElementSocket from "./FgVolumeElementSocket";

class FgVolumeElementController {
  private username: string;
  private instance: string;
  private isUser: boolean;
  private fgVolumeElementOptions: FgVolumeElementOptions;

  private audioRef: React.RefObject<HTMLAudioElement>;
  private sliderRef: React.RefObject<HTMLInputElement>;
  private clientMute: React.MutableRefObject<boolean>;
  private localMute: React.MutableRefObject<boolean>;
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

  private volumeState: {
    from: string;
    to: string;
  };
  private setVolumeState: React.Dispatch<
    React.SetStateAction<{
      from: string;
      to: string;
    }>
  >;

  private tracksColorSetterCallback: (() => void) | undefined;

  private fgVolumeElementSocket: FgVolumeElementSocket;

  constructor(
    username: string,
    instance: string,
    isUser: boolean,
    fgVolumeElementOptions: FgVolumeElementOptions,
    audioRef: React.RefObject<HTMLAudioElement>,
    sliderRef: React.RefObject<HTMLInputElement>,
    clientMute: React.MutableRefObject<boolean>,
    localMute: React.MutableRefObject<boolean>,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
    volumeState: {
      from: string;
      to: string;
    },
    setVolumeState: React.Dispatch<
      React.SetStateAction<{
        from: string;
        to: string;
      }>
    >,
    tracksColorSetterCallback: (() => void) | undefined
  ) {
    this.username = username;
    this.instance = instance;
    this.isUser = isUser;
    this.fgVolumeElementOptions = fgVolumeElementOptions;
    this.audioRef = audioRef;
    this.sliderRef = sliderRef;
    this.clientMute = clientMute;
    this.localMute = localMute;
    this.setActive = setActive;
    this.volumeState = volumeState;
    this.setVolumeState = setVolumeState;
    this.tracksColorSetterCallback = tracksColorSetterCallback;

    this.fgVolumeElementSocket = new FgVolumeElementSocket(
      this.username,
      this.instance,
      this.isUser,
      this.audioRef,
      this.clientMute,
      this.localMute,
      this.setActive,
      this.volumeState,
      this.setVolumeState
    );

    this.volumeSliderChangeHandler.bind(this);
  }

  handleMessage(event: any) {
    switch (event.type) {
      case "clientMuteStateResponsed":
        this.fgVolumeElementSocket.onClientMuteStateResponsed(event);
        break;
      case "clientMuteChange":
        this.fgVolumeElementSocket.onClientMuteChange(event);
        break;
      case "localMuteChange":
        this.fgVolumeElementSocket.onLocalMuteChange();
        break;
      default:
        break;
    }
  }

  volumeSliderChangeHandler() {
    this.tracksColorSetter();

    if (!this.audioRef.current || this.clientMute?.current) {
      return;
    }

    const newVolume = this.audioRef.current.volume;
    let newVolumeState;
    if ((this.audioRef.current.muted && !this.isUser) || newVolume === 0) {
      newVolumeState = "off";
    } else if (this.audioRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (this.volumeState.to !== newVolumeState) {
      this.audioRef.current.muted = newVolumeState === "off";

      this.setVolumeState((prev) => ({
        from: prev.to,
        to: newVolumeState,
      }));
    }
  }

  tracksColorSetter() {
    if (!this.sliderRef.current || !this.audioRef.current) {
      return;
    }

    let value = this.audioRef.current.volume;
    if (this.audioRef.current.muted && !this.clientMute.current) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${this.fgVolumeElementOptions.primaryVolumeSliderColor} 0%, ${this.fgVolumeElementOptions.primaryVolumeSliderColor} ${percentage}%, ${this.fgVolumeElementOptions.secondaryVolumeSliderColor} ${percentage}%, ${this.fgVolumeElementOptions.secondaryVolumeSliderColor} 100%)`;

    this.sliderRef.current.style.background = trackColor;

    if (this.tracksColorSetterCallback) {
      this.tracksColorSetterCallback();
    }
  }
}

export default FgVolumeElementController;
