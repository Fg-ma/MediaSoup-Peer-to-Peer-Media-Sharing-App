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

  private acceptsCameraEffects: React.Dispatch<React.SetStateAction<boolean>>;
  private acceptsScreenEffects: React.Dispatch<React.SetStateAction<boolean>>;
  private acceptsAudioEffects: React.Dispatch<React.SetStateAction<boolean>>;

  private onNewConsumerWasCreatedCallback?: () => void;

  private bundleSocket: BundleSocket;

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
    acceptsCameraEffects: React.Dispatch<React.SetStateAction<boolean>>,
    acceptsScreenEffects: React.Dispatch<React.SetStateAction<boolean>>,
    acceptsAudioEffects: React.Dispatch<React.SetStateAction<boolean>>,
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
    this.remoteCurrentEffectsStyles = remoteCurrentEffectsStyles;
    this.userMedia = userMedia;
    this.audioRef = audioRef;
    this.clientMute = clientMute;
    this.localMute = localMute;
    this.acceptsCameraEffects = acceptsCameraEffects;
    this.acceptsScreenEffects = acceptsScreenEffects;
    this.acceptsAudioEffects = acceptsAudioEffects;
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
      this.remoteCurrentEffectsStyles,
      this.userMedia,
      this.audioRef,
      this.clientMute,
      this.localMute,
      this.acceptsCameraEffects,
      this.acceptsScreenEffects,
      this.acceptsAudioEffects,
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
      case "localMuteChange":
        this.bundleSocket.onLocalMuteChange();
        break;
      case "statesPermissionsResponsed":
        this.bundleSocket.onStatesPermissionsResponsed(event);
        break;
      default:
        break;
    }
  }
}

export default BundleController;
