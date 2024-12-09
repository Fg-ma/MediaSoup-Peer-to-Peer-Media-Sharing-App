import React from "react";
import { Socket } from "socket.io-client";
import Bundle from "./bundle/Bundle";
import { Permissions } from "./context/permissionsContext/PermissionsContext";
import { UserMediaType } from "./context/streamsContext/typeConstant";

class BundlesController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private userMedia: React.MutableRefObject<UserMediaType>,

    private remoteVideosContainerRef: React.RefObject<HTMLDivElement>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isAudio: React.MutableRefObject<boolean>,

    private bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,

    private muteAudio: () => void,

    private setUpEffectContext: (
      username: string,
      instance: string,
      cameraIds: (string | undefined)[],
      screenIds: (string | undefined)[],
      screenAudioIds: (string | undefined)[]
    ) => void,

    private permissions: React.MutableRefObject<Permissions>
  ) {}

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

      const initScreenAudioStreams: { [screenAudioId: string]: MediaStream } =
        {};
      for (const screenAudioId in this.userMedia.current.screenAudio) {
        initScreenAudioStreams[screenAudioId] =
          this.userMedia.current.screenAudio[screenAudioId].getMasterStream();
      }

      const initAudioStream = this.userMedia.current.audio?.getMasterStream();

      const newBundle = (
        <Bundle
          table_id={this.table_id.current}
          activeUsername={undefined}
          activeInstance={undefined}
          username={this.username.current}
          instance={this.instance.current}
          socket={this.socket}
          initCameraStreams={
            this.isCamera.current ? initCameraStreams : undefined
          }
          initScreenStreams={
            this.isScreen.current ? initScreenStreams : undefined
          }
          initScreenAudioStreams={
            this.isScreen.current ? initScreenAudioStreams : undefined
          }
          initAudioStream={this.isAudio.current ? initAudioStream : undefined}
          options={{
            isUser: true,
            permissions: this.permissions.current,
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
    remoteScreenAudioStreams: {
      [screenAudioId: string]: MediaStream;
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
        Object.keys(remoteScreenStreams),
        Object.keys(remoteScreenAudioStreams)
      );

      const newBundle = (
        <Bundle
          socket={this.socket}
          table_id={this.table_id.current}
          activeUsername={this.username.current}
          activeInstance={this.instance.current}
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
          initScreenAudioStreams={
            Object.keys(remoteScreenAudioStreams).length !== 0
              ? remoteScreenAudioStreams
              : undefined
          }
          initAudioStream={remoteAudioStream ? remoteAudioStream : undefined}
          onRendered={() => {
            const msg = {
              type: "requestPermissions",
              table_id: this.table_id.current,
              inquiringUsername: this.username.current,
              inquiringInstance: this.instance.current,
              inquiredUsername: trackUsername,
              inquiredInstance: trackInstance,
            };

            this.socket.current.emit("message", msg);

            const message = {
              type: "requestBundleMetadata",
              table_id: this.table_id.current,
              inquiringUsername: this.username.current,
              inquiringInstance: this.instance.current,
              inquiredUsername: trackUsername,
              inquiredInstance: trackInstance,
            };

            this.socket.current.emit("message", message);
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
