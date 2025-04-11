import { IncomingMediasoupMessages } from "../../serverControllers/mediasoupServer/lib/typeConstant";
import FgVolumeElementSocket from "../../fgVolumeElement/lib/FgVolumeElementSocket";
import { FgVolumeElementOptions } from "./typeConstant";
import { Signals } from "../../context/signalContext/SignalContext";

class FgVolumeElementController extends FgVolumeElementSocket {
  constructor(
    private table_id: string,
    username: string,
    instance: string,
    private producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    isUser: boolean,
    private fgVolumeElementOptions: FgVolumeElementOptions,
    audioRef: React.RefObject<HTMLAudioElement>,
    private sliderRef: React.RefObject<HTMLInputElement>,
    clientMute: React.MutableRefObject<boolean>,
    screenAudioClientMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    localMute: React.MutableRefObject<boolean>,
    screenAudioLocalMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
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
    private tracksColorSetterCallback:
      | ((
          producerType: "audio" | "screenAudio",
          producerId: string | undefined,
        ) => void)
      | undefined,
  ) {
    super(
      username,
      instance,
      producerId,
      isUser,
      audioRef,
      clientMute,
      screenAudioClientMute,
      localMute,
      screenAudioLocalMute,
      volumeState,
      setVolumeState,
    );
  }

  handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "clientMuteStateResponsed":
        this.onClientMuteStateResponsed(event);
        break;
      case "clientMuteChange":
        this.onClientMuteChange(event);
        break;
      default:
        break;
    }
  };

  volumeSliderChangeHandler = () => {
    this.tracksColorSetter();

    if (this.producerType === "audio") {
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
    } else {
      if (
        !this.producerId ||
        this.screenAudioClientMute.current[this.producerId]
      ) {
        return;
      }

      const audioElement = document.getElementById(
        this.producerId,
      ) as HTMLAudioElement | null;

      if (!audioElement) {
        return;
      }

      const newVolume = audioElement.volume;
      let newVolumeState;
      if ((audioElement.muted && !this.isUser) || newVolume === 0) {
        newVolumeState = "off";
      } else if (audioElement.volume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (this.volumeState.to !== newVolumeState) {
        audioElement.muted = newVolumeState === "off";

        this.setVolumeState((prev) => ({
          from: prev.to,
          to: newVolumeState,
        }));
      }
    }
  };

  tracksColorSetter = () => {
    if (!this.sliderRef.current) {
      return;
    }

    if (this.producerType === "audio") {
      if (!this.audioRef.current) {
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
    } else {
      if (!this.producerId) {
        return;
      }

      const audioElement = document.getElementById(
        this.producerId,
      ) as HTMLAudioElement | null;
      if (!audioElement) {
        return;
      }

      let value = audioElement.volume;

      if (
        audioElement.muted &&
        !this.screenAudioClientMute.current[this.producerId]
      ) {
        value = 0;
      }
      const min = 0;
      const max = 1;
      const percentage = ((value - min) / (max - min)) * 100;
      const trackColor = `linear-gradient(to right, ${this.fgVolumeElementOptions.primaryVolumeSliderColor} 0%, ${this.fgVolumeElementOptions.primaryVolumeSliderColor} ${percentage}%, ${this.fgVolumeElementOptions.secondaryVolumeSliderColor} ${percentage}%, ${this.fgVolumeElementOptions.secondaryVolumeSliderColor} 100%)`;

      this.sliderRef.current.style.background = trackColor;
    }

    if (this.tracksColorSetterCallback) {
      this.tracksColorSetterCallback(this.producerType, this.producerId);
    }
  };

  handleSignalMessages = (message: Signals) => {
    switch (message.type) {
      case "localMuteChange":
        const {
          table_id: newTable_id,
          username: newUsername,
          instance: newInstance,
          producerType: newProducerType,
          producerId: newProducerId,
        } = message.header;
        if (
          newTable_id === this.table_id &&
          newUsername === this.username &&
          newInstance === this.instance
        ) {
          setTimeout(() => {
            this.onLocalMuteChange(newProducerType, newProducerId);
          }, 0);
        }
        break;
      default:
        break;
    }
  };
}

export default FgVolumeElementController;
