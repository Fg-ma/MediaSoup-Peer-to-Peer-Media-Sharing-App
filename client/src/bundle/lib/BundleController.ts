import BundleSocket from "./BundleSocket";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import {
  volumeHigh1a,
  volumeHigh1b,
  volumeHigh2a,
  volumeHigh2b,
  volumeHigh3a,
  volumeHigh3b,
  volumeHighOffIB1a,
  volumeHighOffIB1b,
  volumeHighOffIB2a,
  volumeHighOffIB2b,
  volumeHighOffIB3a,
  volumeHighOffIB3b,
  volumeOff1a,
  volumeOff1b,
  volumeOff2a,
  volumeOff2b,
  volumeOff3a,
  volumeOff3b,
  volumeLow1a,
  volumeLow1b,
  volumeLow2a,
  volumeLow2b,
  volumeLow3a,
  volumeLow3b,
  volumeHighLowIB1a,
  volumeHighLowIB1b,
  volumeHighLowIB2a,
  volumeHighLowIB2b,
  volumeHighLowIB3a,
  volumeHighLowIB3b,
  volumeLowOffA1a,
  volumeLowOffA1b,
  volumeLowOffA2a,
  volumeLowOffA2b,
  volumeLowOffA3a,
  volumeLowOffA3b,
  volumeLowOffB1a,
  volumeLowOffB1b,
  volumeLowOffB2a,
  volumeLowOffB2b,
  volumeLowOffB3a,
  volumeLowOffB3b,
} from "../../fgVideo/lib/svgPaths";

class BundleController {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean>;
  private videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  private setPaths: React.Dispatch<React.SetStateAction<string[][]>>;
  private isFinishedRef: React.MutableRefObject<boolean>;
  private changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMute: React.MutableRefObject<boolean>;
  private setCameraStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [screenKey: string]: MediaStream;
        }
      | undefined
    >
  >;
  private setScreenStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [screenKey: string]: MediaStream;
        }
      | undefined
    >
  >;
  private setAudioStream: React.Dispatch<
    React.SetStateAction<MediaStream | undefined>
  >;
  private remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?:
        | {
            [cameraId: string]: MediaStreamTrack;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: MediaStreamTrack;
          }
        | undefined;
      audio?: MediaStreamTrack | undefined;
    };
  }>;
  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  private bundleRef: React.RefObject<HTMLDivElement>;
  private primaryVolumeSliderColor: string;
  private secondaryVolumeSliderColor: string;
  private muteButtonCallback: (() => any) | undefined;

  private BundleSocket: BundleSocket;

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean>,
    videoIconStateRef: React.MutableRefObject<{
      from: string;
      to: string;
    }>,
    setPaths: React.Dispatch<React.SetStateAction<string[][]>>,
    isFinishedRef: React.MutableRefObject<boolean>,
    changedWhileNotFinishedRef: React.MutableRefObject<boolean>,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMute: React.MutableRefObject<boolean>,
    setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        camera?:
          | {
              [cameraId: string]: MediaStreamTrack;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: MediaStreamTrack;
            }
          | undefined;
        audio?: MediaStreamTrack | undefined;
      };
    }>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    bundleRef: React.RefObject<HTMLDivElement>,
    primaryVolumeSliderColor: string,
    secondaryVolumeSliderColor: string,
    muteButtonCallback: (() => any) | undefined
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.videoIconStateRef = videoIconStateRef;
    this.setPaths = setPaths;
    this.isFinishedRef = isFinishedRef;
    this.changedWhileNotFinishedRef = changedWhileNotFinishedRef;
    this.audioRef = audioRef;
    this.localMute = localMute;
    this.setCameraStreams = setCameraStreams;
    this.setScreenStreams = setScreenStreams;
    this.setAudioStream = setAudioStream;
    this.remoteTracksMap = remoteTracksMap;
    this.userMedia = userMedia;
    this.bundleRef = bundleRef;
    this.primaryVolumeSliderColor = primaryVolumeSliderColor;
    this.secondaryVolumeSliderColor = secondaryVolumeSliderColor;
    this.muteButtonCallback = muteButtonCallback;

    this.BundleSocket = new BundleSocket(
      this.isUser,
      this.username,
      this.clientMute,
      this.videoIconStateRef,
      this.getPaths,
      this.setPaths,
      this.isFinishedRef,
      this.changedWhileNotFinishedRef,
      this.audioRef,
      this.localMute,
      this.setCameraStreams,
      this.setScreenStreams,
      this.setAudioStream,
      this.remoteTracksMap,
      this.userMedia
    );

    this.handleMute = this.handleMute.bind(this);
    this.volumeChangeHandler = this.volumeChangeHandler.bind(this);
    this.tracksColorSetter = this.tracksColorSetter.bind(this);
  }

  handleMessage(event: any) {
    switch (event.type) {
      case "producerDisconnected":
        this.BundleSocket.onProducerDisconnected(event);
        break;
      case "newProducerWasCreated":
        this.BundleSocket.onNewProducerWasCreated(event);
        break;
      case "newConsumerWasCreated":
        this.BundleSocket.onNewConsumerWasCreated(event);
        break;
      case "clientMuteStateResponsed":
        this.BundleSocket.onClientMuteStateResponsed(event);
        break;
      case "clientMuteChange":
        this.BundleSocket.onClientMuteChange(event);
        break;
      case "localMuteChange":
        this.BundleSocket.onLocalMuteChange();
        break;
      default:
        break;
    }
  }

  getPaths(from: string, to: string) {
    let newPaths: string[][] = [];
    if (from === "high" && to === "off") {
      newPaths = [
        [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
        [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
        [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
        [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
        [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
        [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
      ];
    } else if (from === "off" && to === "high") {
      newPaths = [
        [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
        [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
        [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
        [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
        [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
        [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
      ];
    } else if (from === "low" && to === "off") {
      newPaths = [
        [volumeLow1a, volumeLowOffA1a, volumeLowOffB1a, volumeOff1a],
        [volumeLow1b, volumeLowOffA1b, volumeLowOffB1b, volumeOff1b],
        [volumeLow2a, volumeLowOffA2a, volumeLowOffB2a, volumeOff2a],
        [volumeLow2b, volumeLowOffA2b, volumeLowOffB2b, volumeOff2b],
        [volumeLow3a, volumeLowOffA3a, volumeLowOffB3a, volumeOff3a],
        [volumeLow3b, volumeLowOffA3b, volumeLowOffB3b, volumeOff3b],
      ];
    } else if (from === "off" && to === "low") {
      newPaths = [
        [volumeOff1a, volumeLowOffB1a, volumeLowOffA1a, volumeLow1a],
        [volumeOff1b, volumeLowOffB1b, volumeLowOffA1b, volumeLow1b],
        [volumeOff2a, volumeLowOffB2a, volumeLowOffA2a, volumeLow2a],
        [volumeOff2b, volumeLowOffB2b, volumeLowOffA2b, volumeLow2b],
        [volumeOff3a, volumeLowOffB3a, volumeLowOffA3a, volumeLow3a],
        [volumeOff3b, volumeLowOffB3b, volumeLowOffA3b, volumeLow3b],
      ];
    } else if (from === "high" && to === "low") {
      newPaths = [
        [volumeHigh1a, volumeHighLowIB1a, volumeLow1a],
        [volumeHigh1b, volumeHighLowIB1b, volumeLow1b],
        [volumeHigh2a, volumeHighLowIB2a, volumeLow2a],
        [volumeHigh2b, volumeHighLowIB2b, volumeLow2b],
        [volumeHigh3a, volumeHighLowIB3a, volumeLow3a],
        [volumeHigh3b, volumeHighLowIB3b, volumeLow3b],
      ];
    } else if (from === "low" && to === "high") {
      newPaths = [
        [volumeLow1a, volumeHighLowIB1a, volumeHigh1a],
        [volumeLow1b, volumeHighLowIB1b, volumeHigh1b],
        [volumeLow2a, volumeHighLowIB2a, volumeHigh2a],
        [volumeLow2b, volumeHighLowIB2b, volumeHigh2b],
        [volumeLow3a, volumeHighLowIB3a, volumeHigh3a],
        [volumeLow3b, volumeHighLowIB3b, volumeHigh3b],
      ];
    }
    return newPaths;
  }

  volumeChangeHandler() {
    if (!this.bundleRef.current) {
      return;
    }

    const volumeSliders =
      this.bundleRef.current.querySelectorAll(".volume-slider");

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (this.audioRef.current) {
        sliderElement.value = this.audioRef.current.muted
          ? "0"
          : this.audioRef.current.volume.toString();
      }
    });
    this.tracksColorSetter();

    if (!this.audioRef.current || this.clientMute.current) {
      return;
    }

    const newVolume = this.audioRef.current.volume;
    let newVolumeState;
    if (this.audioRef.current.muted || newVolume === 0) {
      newVolumeState = "off";
    } else if (this.audioRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (
      !this.isFinishedRef.current &&
      this.videoIconStateRef.current.to !== newVolumeState
    ) {
      if (!this.changedWhileNotFinishedRef.current) {
        this.changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    if (this.videoIconStateRef.current.to !== newVolumeState) {
      const { from, to } = this.videoIconStateRef.current;
      this.videoIconStateRef.current = { from: to, to: newVolumeState };

      if (newVolumeState === "off") {
        this.audioRef.current.muted = true;

        if (!this.isFinishedRef.current) {
          if (!this.changedWhileNotFinishedRef.current) {
            this.changedWhileNotFinishedRef.current = true;
          }
          return;
        }

        this.videoIconStateRef.current = {
          from: this.videoIconStateRef.current.to,
          to: "off",
        };

        const newPaths = this.getPaths(
          this.videoIconStateRef.current.from,
          "off"
        );
        if (newPaths[0]) {
          this.setPaths(newPaths);
        }
      } else {
        this.audioRef.current.muted = false;

        const newVolume = this.audioRef.current.volume;
        let newVolumeState;
        if (newVolume === 0) {
          newVolumeState = "off";
        } else if (newVolume >= 0.5) {
          newVolumeState = "high";
        } else {
          newVolumeState = "low";
        }

        if (
          !this.isFinishedRef.current &&
          this.videoIconStateRef.current.to !== newVolumeState
        ) {
          if (!this.changedWhileNotFinishedRef.current) {
            this.changedWhileNotFinishedRef.current = true;
          }
          return;
        }

        this.videoIconStateRef.current = {
          from: this.videoIconStateRef.current.to,
          to: newVolumeState,
        };

        const newPaths = this.getPaths(
          this.videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths[0]) {
          this.setPaths(newPaths);
        }
      }

      const newPaths = this.getPaths(to, newVolumeState);
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    }
  }

  tracksColorSetter() {
    if (!this.bundleRef.current || !this.audioRef.current) {
      return;
    }

    const volumeSliders =
      this.bundleRef.current.querySelectorAll(".volume-slider");

    let value = this.audioRef.current.volume;
    if (this.audioRef.current.muted) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${this.primaryVolumeSliderColor} 0%, ${this.primaryVolumeSliderColor} ${percentage}%, ${this.secondaryVolumeSliderColor} ${percentage}%, ${this.secondaryVolumeSliderColor} 100%)`;

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      sliderElement.style.background = trackColor;
    });
  }

  handleVolumeSlider(event: React.ChangeEvent<HTMLInputElement>) {
    const volume = parseFloat(event.target.value);

    if (this.audioRef.current) {
      this.audioRef.current.volume = volume;
      if (!this.clientMute.current) {
        this.audioRef.current.muted = volume > 0 ? false : true;
      }
    }

    if (this.bundleRef.current) {
      const volumeSliders =
        this.bundleRef.current.querySelectorAll(".volume-slider");

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${volume}`;
      });
    }

    this.tracksColorSetter();
  }

  handleMute() {
    if (this.muteButtonCallback !== undefined) {
      this.muteButtonCallback();
    }

    if (this.clientMute.current) {
      return;
    }

    this.localMute.current = !this.localMute.current;

    if (this.audioRef.current && !this.isUser) {
      this.audioRef.current.muted = this.localMute.current;
    }

    if (this.localMute.current) {
      if (!this.isFinishedRef.current) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: "off",
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        "off"
      );
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    } else {
      if (!this.audioRef.current) {
        return;
      }

      const newVolume = this.audioRef.current.volume;
      let newVolumeState;
      if (newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (
        !this.isFinishedRef.current &&
        this.videoIconStateRef.current.to !== newVolumeState
      ) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        newVolumeState
      );
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    }
  }
}

export default BundleController;
