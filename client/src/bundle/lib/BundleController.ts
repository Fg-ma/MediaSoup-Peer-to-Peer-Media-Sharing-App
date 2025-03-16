import {
  RemoteMediaType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import {
  RemoteEffectStylesType,
  RemoteStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import BundleSocket from "./BundleSocket";
import { BundleOptions } from "./typeConstant";
import { Permissions } from "../../context/permissionsContext/typeConstant";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import { IncomingMediasoupMessages } from "../../serverControllers/mediasoupServer/lib/typeConstant";

class BundleController extends BundleSocket {
  constructor(
    mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    isUser: boolean,
    table_id: string,
    username: string,
    instance: string,
    bundleOptions: BundleOptions,
    setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [cameraId: string]: MediaStream;
          }
        | undefined
      >
    >,
    setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenId: string]: MediaStream;
          }
        | undefined
      >
    >,
    setScreenAudioStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenAudioId: string]: MediaStream;
          }
        | undefined
      >
    >,
    setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    remoteMedia: React.MutableRefObject<RemoteMediaType>,
    remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    userMedia: React.MutableRefObject<UserMediaType>,
    private bundleRef: React.RefObject<HTMLDivElement>,
    audioRef: React.RefObject<HTMLAudioElement>,
    clientMute: React.MutableRefObject<boolean>,
    screenAudioClientMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    localMute: React.MutableRefObject<boolean>,
    screenAudioLocalMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    permissions: Permissions,
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    onNewConsumerWasCreatedCallback: (() => void) | undefined,
    private handleMuteCallback:
      | ((
          producerType: "audio" | "screenAudio",
          producerId: string | undefined
        ) => void)
      | undefined
  ) {
    super(
      mediasoupSocket,
      isUser,
      table_id,
      username,
      instance,
      bundleOptions,
      setCameraStreams,
      setScreenStreams,
      setScreenAudioStreams,
      setAudioStream,
      remoteMedia,
      remoteStreamEffects,
      remoteEffectsStyles,
      userMedia,
      audioRef,
      clientMute,
      screenAudioClientMute,
      localMute,
      screenAudioLocalMute,
      permissions,
      setPermissions,
      onNewConsumerWasCreatedCallback
    );
  }

  handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "producerDisconnected":
        this.onProducerDisconnected(event);
        break;
      case "newProducerWasCreated":
        this.onNewProducerWasCreated(event);
        break;
      case "newConsumerWasCreated":
        this.onNewConsumerWasCreated(event);
        break;
      case "clientMuteChange":
        this.onClientMuteChange(event);
        break;
      case "permissionsResponsed":
        this.onPermissionsResponsed(event);
        break;
      case "bundleMetadataResponsed":
        this.onBundleMetadataResponsed(event);
        break;
      case "effectChangeRequested":
        this.onEffectChangeRequested(event);
        break;
      case "clientEffectChanged":
        this.onClientEffectChanged(event);
        break;
      default:
        break;
    }
  };

  tracksColorSetterCallback = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => {
    if (!this.bundleRef.current) {
      return;
    }

    const volumeSliders = this.bundleRef.current.querySelectorAll(
      `.volume-slider-${producerType}${producerId ? producerId : ""}`
    );

    if (producerType === "audio") {
      if (!this.audioRef.current) {
        return;
      }

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
    } else {
      if (!producerId) {
        return;
      }

      const audioElement = document.getElementById(
        producerId
      ) as HTMLAudioElement | null;

      if (!audioElement) {
        return;
      }

      let value = audioElement.volume;
      if (
        audioElement.muted &&
        !this.bundleOptions.isUser &&
        !this.screenAudioClientMute.current[producerId]
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
    }
  };

  handleVolumeSliderCallback = (
    event: React.ChangeEvent<HTMLInputElement>,
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => {
    const volume = parseFloat(event.target.value);

    if (this.bundleRef.current) {
      const volumeSliders = this.bundleRef.current.querySelectorAll(
        `.volume-slider-${producerType}${producerId ? producerId : ""}`
      );

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${volume}`;
      });
    }

    this.tracksColorSetterCallback(producerType, producerId);
  };

  handleMute = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => {
    if (this.handleMuteCallback) {
      this.handleMuteCallback(producerType, producerId);
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
