import React from "react";
import { Socket } from "socket.io-client";
import Bundle from "./bundle/Bundle";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

class BundlesController {
  socket: React.MutableRefObject<Socket>;
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;

  userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;

  remoteVideosContainerRef: React.RefObject<HTMLDivElement>;

  isCamera: React.MutableRefObject<boolean>;
  isScreen: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;

  setBundles: React.Dispatch<
    React.SetStateAction<{
      [username: string]: React.JSX.Element;
    }>
  >;

  muteAudio: () => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
    isCamera: React.MutableRefObject<boolean>,
    isScreen: React.MutableRefObject<boolean>,
    isAudio: React.MutableRefObject<boolean>,
    setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: React.JSX.Element;
      }>
    >,
    muteAudio: () => void
  ) {
    this.socket = socket;
    this.table_id = table_id;
    this.username = username;
    this.userMedia = userMedia;
    this.remoteVideosContainerRef = remoteVideosContainerRef;
    this.isCamera = isCamera;
    this.isScreen = isScreen;
    this.isAudio = isAudio;
    this.setBundles = setBundles;
    this.muteAudio = muteAudio;
  }

  createProducerBundle = () => {
    if (this.remoteVideosContainerRef.current) {
      const initCameraStreams: { [cameraId: string]: MediaStream } = {};
      for (const cameraId in this.userMedia.current.camera) {
        initCameraStreams[cameraId] =
          this.userMedia.current.camera[cameraId].getStream();
      }

      const initScreenStreams: { [screenId: string]: MediaStream } = {};
      for (const screenId in this.userMedia.current.screen) {
        initScreenStreams[screenId] =
          this.userMedia.current.screen[screenId].getStream();
      }

      const initAudioStream = this.userMedia.current.audio?.getStream();

      const newBundle = (
        <Bundle
          username={this.username.current}
          table_id={this.table_id.current}
          socket={this.socket}
          initCameraStreams={
            this.isCamera.current ? initCameraStreams : undefined
          }
          initScreenStreams={
            this.isScreen.current ? initScreenStreams : undefined
          }
          initAudioStream={this.isAudio.current ? initAudioStream : undefined}
          options={{
            isUser: true,
          }}
          handleMuteCallback={this.muteAudio}
        />
      );

      this.setBundles((prev) => ({
        ...prev,
        [this.username.current]: newBundle,
      }));
    }
  };

  createConsumerBundle = (
    trackUsername: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => {
    const newBundle = (
      <Bundle
        username={trackUsername}
        table_id={this.table_id.current}
        socket={this.socket}
        initCameraStreams={
          Object.keys(remoteCameraStreams).length !== 0
            ? remoteCameraStreams
            : undefined
        }
        initScreenStreams={
          Object.keys(remoteScreenStreams).length !== 0
            ? remoteScreenStreams
            : undefined
        }
        initAudioStream={remoteAudioStream ? remoteAudioStream : undefined}
        onRendered={() => {
          const msg = {
            type: "requestClientMuteState",
            table_id: this.table_id.current,
            username: this.username.current,
            producerUsername: trackUsername,
          };

          this.socket.current.emit("message", msg);
        }}
        onNewConsumerWasCreatedCallback={() => {
          const msg = {
            type: "requestClientMuteState",
            table_id: this.table_id.current,
            username: this.username.current,
            producerUsername: trackUsername,
          };

          this.socket.current.emit("message", msg);
        }}
      />
    );

    this.setBundles((prev) => ({
      ...prev,
      [trackUsername]: newBundle,
    }));
  };
}

export default BundlesController;
