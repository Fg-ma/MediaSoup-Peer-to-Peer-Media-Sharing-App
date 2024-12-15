import { Socket } from "socket.io-client";
import {
  RemoteMediaType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import {
  RemoteEffectStylesType,
  AudioEffectTypes,
  RemoteStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import BundleSocket from "./BundleSocket";
import { BundleControllerMessageType, BundleOptions } from "./typeConstant";
import { Permissions } from "../../context/permissionsContext/typeConstant";

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
            [cameraId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenAudioStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenAudioId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private permissions: Permissions,
    private setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    private onNewConsumerWasCreatedCallback?: () => void,
    private handleMuteCallback?: () => void
  ) {
    this.bundleSocket = new BundleSocket(
      this.isUser,
      this.username,
      this.instance,
      this.setCameraStreams,
      this.setScreenStreams,
      this.setScreenAudioStreams,
      this.setAudioStream,
      this.remoteMedia,
      this.remoteStreamEffects,
      this.remoteEffectsStyles,
      this.userMedia,
      this.audioRef,
      this.clientMute,
      this.localMute,
      this.permissions,
      this.setPermissions,
      this.handleAudioEffectChange,
      this.onNewConsumerWasCreatedCallback
    );
  }

  handleAudioEffectChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => {
    if (this.bundleOptions.isUser) {
      if (producerType === "audio") {
        this.userMedia.current.audio?.changeEffects(effect, false);
      } else if (producerType === "screenAudio" && producerId) {
        this.userMedia.current.screenAudio[producerId].changeEffects(
          effect,
          false
        );
      }

      if (
        (producerType === "audio" && this.permissions.acceptsAudioEffects) ||
        (producerType === "screenAudio" &&
          this.permissions.acceptsScreenAudioEffects)
      ) {
        const msg = {
          type: "clientEffectChange",
          table_id: this.table_id,
          username: this.username,
          instance: this.instance,
          producerType,
          producerId,
          effect: effect,
          blockStateChange: false,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (
      (producerType === "audio" && this.permissions.acceptsAudioEffects) ||
      (producerType === "screenAudio" &&
        this.permissions.acceptsScreenAudioEffects)
    ) {
      const msg = {
        type: "requestEffectChange",
        table_id: this.table_id,
        requestedUsername: this.username,
        requestedInstance: this.instance,
        requestedProducerType: producerType,
        requestedProducerId: producerId,
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
      case "permissionsResponsed":
        this.bundleSocket.onPermissionsResponsed(event);
        break;
      case "bundleMetadataResponsed":
        this.bundleSocket.onBundleMetadataResponsed(event);
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
