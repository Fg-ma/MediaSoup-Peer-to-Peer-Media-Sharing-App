import BundleSocket from "./BundleSocket";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "src/context/StreamsContext";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";

class BundleController {
  private isUser: boolean;
  private username: string;
  private instance: string;

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
  }>;
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
  }>;
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private remoteCurrentEffectsStyles: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: EffectStylesType;
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

  private audioRef: React.RefObject<HTMLAudioElement>;

  private clientMute: React.MutableRefObject<boolean>;
  private localMute: React.MutableRefObject<boolean>;

  private acceptsAudioEffects: boolean;
  private setAcceptsCameraEffects: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  private setAcceptsScreenEffects: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  private setAcceptsAudioEffects: React.Dispatch<React.SetStateAction<boolean>>;
  private handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>;

  private onNewConsumerWasCreatedCallback?: () => void;

  bundleSocket: BundleSocket;

  constructor(
    isUser: boolean,
    username: string,
    instance: string,
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
    remoteStreamEffects: React.MutableRefObject<{
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
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
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
    audioRef: React.RefObject<HTMLAudioElement>,
    clientMute: React.MutableRefObject<boolean>,
    localMute: React.MutableRefObject<boolean>,
    acceptsAudioEffects: boolean,
    setAcceptsCameraEffects: React.Dispatch<React.SetStateAction<boolean>>,
    setAcceptsScreenEffects: React.Dispatch<React.SetStateAction<boolean>>,
    setAcceptsAudioEffects: React.Dispatch<React.SetStateAction<boolean>>,
    handleAudioEffectChange: (effect: AudioEffectTypes) => Promise<void>,
    onNewConsumerWasCreatedCallback?: () => any
  ) {
    this.isUser = isUser;
    this.username = username;
    this.instance = instance;
    this.setCameraStreams = setCameraStreams;
    this.setScreenStreams = setScreenStreams;
    this.setAudioStream = setAudioStream;
    this.remoteTracksMap = remoteTracksMap;
    this.remoteStreamEffects = remoteStreamEffects;
    this.currentEffectsStyles = currentEffectsStyles;
    this.remoteCurrentEffectsStyles = remoteCurrentEffectsStyles;
    this.userMedia = userMedia;
    this.audioRef = audioRef;
    this.clientMute = clientMute;
    this.localMute = localMute;
    this.acceptsAudioEffects = acceptsAudioEffects;
    this.setAcceptsCameraEffects = setAcceptsCameraEffects;
    this.setAcceptsScreenEffects = setAcceptsScreenEffects;
    this.setAcceptsAudioEffects = setAcceptsAudioEffects;
    this.handleAudioEffectChange = handleAudioEffectChange;
    this.onNewConsumerWasCreatedCallback = onNewConsumerWasCreatedCallback;

    this.bundleSocket = new BundleSocket(
      this.isUser,
      this.username,
      this.instance,
      this.setCameraStreams,
      this.setScreenStreams,
      this.setAudioStream,
      this.remoteTracksMap,
      this.remoteStreamEffects,
      this.currentEffectsStyles,
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

  handleMessage(event: any) {
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
  }
}

export default BundleController;
