import AudioMedia from "../../lib/AudioMedia";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";

class BundleSocket {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean>;
  private videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  private getPaths: (from: string, to: string) => string[][];
  private setPaths: React.Dispatch<React.SetStateAction<string[][]>>;
  private isFinishedRef: React.MutableRefObject<boolean>;
  private changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMuted: React.MutableRefObject<boolean>;
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

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean>,
    videoIconStateRef: React.MutableRefObject<{
      from: string;
      to: string;
    }>,
    getPaths: (from: string, to: string) => string[][],
    setPaths: React.Dispatch<React.SetStateAction<string[][]>>,
    isFinishedRef: React.MutableRefObject<boolean>,
    changedWhileNotFinishedRef: React.MutableRefObject<boolean>,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMuted: React.MutableRefObject<boolean>,
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
    }>
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.videoIconStateRef = videoIconStateRef;
    this.getPaths = getPaths;
    this.setPaths = setPaths;
    this.isFinishedRef = isFinishedRef;
    this.changedWhileNotFinishedRef = changedWhileNotFinishedRef;
    this.audioRef = audioRef;
    this.localMuted = localMuted;
    this.setCameraStreams = setCameraStreams;
    this.setScreenStreams = setScreenStreams;
    this.setAudioStream = setAudioStream;
    this.remoteTracksMap = remoteTracksMap;
    this.userMedia = userMedia;
  }

  onClientMuteStateResponsed(event: {
    type: string;
    producerUsername: string;
  }) {
    if (this.isUser || this.username !== event.producerUsername) {
      return;
    }

    this.clientMute.current = true;

    if (this.videoIconStateRef.current.to !== "off") {
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
    }
  }

  // Get client mute changes from other users
  onClientMuteChange(event: {
    type: string;
    username: string;
    clientMute: boolean;
  }) {
    if (this.isUser || this.username !== event.username) {
      return;
    }

    if (event.clientMute) {
      if (!this.isFinishedRef.current) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      this.clientMute.current = true;

      if (this.videoIconStateRef.current.to !== "off") {
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
      }
    } else {
      this.clientMute.current = false;

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

      if (
        newVolumeState !== this.videoIconStateRef.current.to &&
        !this.audioRef.current.muted
      ) {
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

  // Handles local mute changes from outside bundle
  onLocalMuteChange() {
    this.localMuted.current = !this.localMuted.current;

    if (this.localMuted.current) {
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
}

export default BundleSocket;
