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
import MediasoupSocketController, {
  IncomingMediasoupMessages,
} from "../../lib/MediasoupSocketController";

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
    localMute: React.MutableRefObject<boolean>,
    permissions: Permissions,
    setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    onNewConsumerWasCreatedCallback: (() => void) | undefined,
    private handleMuteCallback: (() => void) | undefined,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
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
      localMute,
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

  gameClosedListner = (event: { data: string }) => {
    const message = JSON.parse(event.data);
    if (message.type === "gameClosed") {
      this.setRerender((prev) => !prev);
    }
  };
}

export default BundleController;
