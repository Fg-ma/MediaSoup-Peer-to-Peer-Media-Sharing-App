import React from "react";
import { Socket } from "socket.io-client";
import Bundle from "./bundle/Bundle";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

class BundlesController {
  private socket: React.MutableRefObject<Socket>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private instance: React.MutableRefObject<string>;

  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;

  private remoteVideosContainerRef: React.RefObject<HTMLDivElement>;

  private isCamera: React.MutableRefObject<boolean>;
  private isScreen: React.MutableRefObject<boolean>;
  private isAudio: React.MutableRefObject<boolean>;

  private bundles: {
    [username: string]: { [instance: string]: React.JSX.Element };
  };
  private setBundles: React.Dispatch<
    React.SetStateAction<{
      [username: string]: { [instance: string]: React.JSX.Element };
    }>
  >;

  private muteAudio: () => void;

  private setUpEffectContext: (
    username: string,
    instance: string,
    cameraIds: (string | undefined)[],
    screenIds: (string | undefined)[]
  ) => void;

  private acceptCameraEffects: boolean;
  private acceptScreenEffects: boolean;
  private acceptAudioEffects: boolean;

  constructor(
    socket: React.MutableRefObject<Socket>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    instance: React.MutableRefObject<string>,

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

    bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
    setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,

    muteAudio: () => void,

    setUpEffectContext: (
      username: string,
      instance: string,
      cameraIds: (string | undefined)[],
      screenIds: (string | undefined)[]
    ) => void,

    acceptCameraEffects: boolean,
    acceptScreenEffects: boolean,
    acceptAudioEffects: boolean
  ) {
    this.socket = socket;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.userMedia = userMedia;
    this.remoteVideosContainerRef = remoteVideosContainerRef;
    this.isCamera = isCamera;
    this.isScreen = isScreen;
    this.isAudio = isAudio;
    this.bundles = bundles;
    this.setBundles = setBundles;
    this.muteAudio = muteAudio;
    this.setUpEffectContext = setUpEffectContext;
    this.acceptCameraEffects = acceptCameraEffects;
    this.acceptScreenEffects = acceptScreenEffects;
    this.acceptAudioEffects = acceptAudioEffects;
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
          table_id={this.table_id.current}
          username={this.username.current}
          instance={this.instance.current}
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
            acceptsCameraEffects: this.acceptCameraEffects,
            acceptsScreenEffects: this.acceptScreenEffects,
            acceptsAudioEffects: this.acceptAudioEffects,
          }}
          handleMuteCallback={this.muteAudio}
        />
      );

      this.setBundles((prev) => {
        const newBundles = {
          ...prev,
          [this.username.current]: {
            ...prev[this.username.current],
            [this.instance.current]: newBundle,
          },
        };
        return newBundles;
      });
    }
  };

  createConsumerBundle = (
    trackUsername: string,
    trackInstance: string,
    remoteCameraStreams: {
      [cameraId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => {
    if (
      !this.bundles[trackUsername] ||
      !this.bundles[trackUsername][trackInstance]
    ) {
      this.setUpEffectContext(
        trackUsername,
        trackInstance,
        Object.keys(remoteCameraStreams),
        Object.keys(remoteScreenStreams)
      );

      const newBundle = (
        <Bundle
          socket={this.socket}
          table_id={this.table_id.current}
          username={trackUsername}
          instance={trackInstance}
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
              type: "requestStatesPermissions",
              table_id: this.table_id.current,
              inquiringUsername: this.username.current,
              inquiringInstance: this.instance.current,
              inquiredUsername: trackUsername,
              inquiredInstance: trackInstance,
            };

            this.socket.current.emit("message", msg);
          }}
          onNewConsumerWasCreatedCallback={() => {
            const msg = {
              type: "requestClientMuteState",
              table_id: this.table_id.current,
              username: this.username.current,
              instance: this.instance.current,
              producerUsername: trackUsername,
              producerInstance: trackInstance,
            };

            this.socket.current.emit("message", msg);
          }}
        />
      );

      this.setBundles((prev) => {
        const newBundles = {
          ...prev,
          [trackUsername]: {
            ...prev[trackUsername],
            [trackInstance]: newBundle,
          },
        };
        return newBundles;
      });
    }
  };
}

export default BundlesController;
