import BundleSocket from "./BundleSocket";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";

class BundleController {
  private isUser: boolean;
  private username: string;
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
  private clientMute: React.MutableRefObject<boolean>;
  private localMute: React.MutableRefObject<boolean>;
  private onNewConsumerWasCreatedCallback?: () => void;

  private bundleSocket: BundleSocket;

  constructor(
    isUser: boolean,
    username: string,
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
    clientMute: React.MutableRefObject<boolean>,
    localMute: React.MutableRefObject<boolean>,
    onNewConsumerWasCreatedCallback?: () => any
  ) {
    this.isUser = isUser;
    this.username = username;
    this.setCameraStreams = setCameraStreams;
    this.setScreenStreams = setScreenStreams;
    this.setAudioStream = setAudioStream;
    this.remoteTracksMap = remoteTracksMap;
    this.userMedia = userMedia;
    this.clientMute = clientMute;
    this.localMute = localMute;
    this.onNewConsumerWasCreatedCallback = onNewConsumerWasCreatedCallback;

    this.bundleSocket = new BundleSocket(
      this.isUser,
      this.username,
      this.setCameraStreams,
      this.setScreenStreams,
      this.setAudioStream,
      this.remoteTracksMap,
      this.userMedia,
      this.clientMute,
      this.localMute,
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
      case "clientMuteStateResponsed":
        this.bundleSocket.onClientMuteStateResponsed(event);
        break;
      case "clientMuteChange":
        this.bundleSocket.onClientMuteChange(event);
        break;
      case "localMuteChange":
        this.bundleSocket.onLocalMuteChange();
        break;
      default:
        break;
    }
  }
}

export default BundleController;
