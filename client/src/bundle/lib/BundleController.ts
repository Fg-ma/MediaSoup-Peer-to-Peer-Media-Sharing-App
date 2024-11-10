import { Socket } from "socket.io-client";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import { EffectStylesType } from "../../context/currentEffectsStylesContext/typeConstant";
import BundleSocket from "./BundleSocket";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import { BundleControllerMessageType, BundleOptions } from "./typeConstant";

class BundleController {
  bundleSocket: BundleSocket;

  constructor(
    private isUser: boolean,
    private table_id: string,
    private username: string,
    private instance: string,
    private socket: React.MutableRefObject<Socket>,
    private bundleOptions: BundleOptions,
    private setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    private remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
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
      };
    }>,
    private remoteStreamEffects: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera: {
            [cameraId: string]: {
              [effectType in CameraEffectTypes]: boolean;
            };
          };
          screen: {
            [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
          };
          audio: { [effectType in AudioEffectTypes]: boolean };
        };
      };
    }>,
    private remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private acceptsAudioEffects: boolean,
    private setAcceptsCameraEffects: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setAcceptsScreenEffects: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setAcceptsAudioEffects: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private onNewConsumerWasCreatedCallback?: () => void,
    private handleMuteCallback?: () => void
  ) {
    this.bundleSocket = new BundleSocket(
      this.isUser,
      this.username,
      this.instance,
      this.setCameraStreams,
      this.setScreenStreams,
      this.setAudioStream,
      this.remoteTracksMap,
      this.remoteStreamEffects,
      this.remoteCurrentEffectsStyles,
      this.userMedia,
      this.audioRef,
      this.clientMute,
      this.localMute,
      this.acceptsAudioEffects,
      this.setAcceptsCameraEffects,
      this.setAcceptsScreenEffects,
      this.setAcceptsAudioEffects,
      this.handleAudioEffectChange,
      this.onNewConsumerWasCreatedCallback
    );
  }

  handleAudioEffectChange = (effect: AudioEffectTypes) => {
    if (this.bundleOptions.isUser) {
      this.userMedia.current.audio?.changeEffects(effect, false);

      if (this.acceptsAudioEffects) {
        const msg = {
          type: "clientEffectChange",
          table_id: this.table_id,
          username: this.username,
          instance: this.instance,
          producerType: "audio",
          producerId: undefined,
          effect: effect,
          blockStateChange: false,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (this.acceptsAudioEffects) {
      const msg = {
        type: "requestEffectChange",
        table_id: this.table_id,
        requestedUsername: this.username,
        requestedInstance: this.instance,
        requestedProducerType: "audio",
        requestedProducerId: undefined,
        effect: effect,
        blockStateChange: false,
      };

      this.socket.current.emit("message", msg);
    }
  };

  handleMessage = (event: BundleControllerMessageType) => {
    switch (event.type) {
      case "producerDisconnected":
        this.bundleSocket.onProducerDisconnected(event);
        break;
      case "newProducerWasCreated":
        this.bundleSocket.onNewProducerWasCreated(event);
        break;
      case "newConsumerWasCreated":
        this.bundleSocket.onNewConsumerWasCreated(event);
        break;
      case "clientMuteChange":
        this.bundleSocket.onClientMuteChange(event);
        break;
      case "statesPermissionsResponsed":
        this.bundleSocket.onStatesPermissionsResponsed(event);
        break;
      case "effectChangeRequested":
        this.bundleSocket.onEffectChangeRequested(event);
        break;
      case "clientEffectChanged":
        this.bundleSocket.onClientEffectChanged(event);
        break;
      default:
        break;
    }
  };

  tracksColorSetterCallback = () => {
    if (!this.bundleRef.current || !this.audioRef.current) {
      return;
    }

    const volumeSliders =
      this.bundleRef.current.querySelectorAll(".volume-slider");

    let value = this.audioRef.current.volume;
    if (
      this.audioRef.current.muted &&
      !this.bundleOptions.isUser &&
      !this.clientMute.current
    ) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${this.bundleOptions.primaryVolumeSliderColor} 0%, ${this.bundleOptions.primaryVolumeSliderColor} ${percentage}%, ${this.bundleOptions.secondaryVolumeSliderColor} ${percentage}%, ${this.bundleOptions.secondaryVolumeSliderColor} 100%)`;

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      sliderElement.style.background = trackColor;
    });
  };

  handleVolumeSliderCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (this.bundleRef.current) {
      const volumeSliders =
        this.bundleRef.current.querySelectorAll(".volume-slider");

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${volume}`;
      });
    }

    this.tracksColorSetterCallback();
  };

  handleMute = () => {
    if (this.handleMuteCallback) {
      this.handleMuteCallback();
    }

    if (this.clientMute.current) {
      return;
    }

    this.localMute.current = !this.localMute.current;

    if (this.audioRef.current && !this.bundleOptions.isUser) {
      this.audioRef.current.muted = this.localMute.current;
    }
  };
}

export default BundleController;
