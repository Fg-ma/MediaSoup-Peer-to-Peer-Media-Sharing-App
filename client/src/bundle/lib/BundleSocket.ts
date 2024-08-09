import AudioMedia from "../../lib/AudioMedia";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";

class BundleSocket {
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

  private onNewConsumerWasCreatedCallback?: () => void;

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
    this.onNewConsumerWasCreatedCallback = onNewConsumerWasCreatedCallback;
  }

  async onNewConsumerWasCreated(event: {
    type: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
  }) {
    if (this.username !== event.producerUsername) {
      return;
    }

    if (event.consumerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            this.remoteTracksMap.current[event.producerUsername].camera?.[
              event.consumerId
            ];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            this.remoteTracksMap.current[event.producerUsername].screen?.[
              event.consumerId
            ];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "audio") {
      const newStream = new MediaStream();
      const track = this.remoteTracksMap.current[event.producerUsername].audio;
      if (track) {
        newStream.addTrack(track);
      }

      this.setAudioStream(newStream);
    }

    if (this.onNewConsumerWasCreatedCallback) {
      this.onNewConsumerWasCreatedCallback();
    }
  }

  onNewProducerWasCreated(event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
  }) {
    if (!this.isUser) {
      return;
    }

    if (event.producerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        if (event.producerId) {
          newStreams[event.producerId] =
            this.userMedia.current.camera[event.producerId].getStream();
        }
        return newStreams;
      });
    } else if (event.producerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        if (event.producerId) {
          newStreams[event.producerId] =
            this.userMedia.current.screen[event.producerId].getStream();
        }
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      this.setAudioStream(this.userMedia.current.audio?.getStream());
    }
  }

  onProducerDisconnected(event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  }) {
    if (event.producerUsername === this.username) {
      if (event.producerType === "camera") {
        this.setCameraStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "screen") {
        this.setScreenStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "audio") {
        this.setAudioStream(undefined);
      }
    }
  }

  // Get client mute changes from other users
  onClientMuteChange(event: {
    type: string;
    username: string;
    clientMute: boolean;
  }) {
    if (this.isUser) {
      return;
    }

    this.clientMute.current = event.clientMute;
  }
}

export default BundleSocket;
