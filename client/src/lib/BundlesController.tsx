import React from "react";
import Bundle from "../bundle/Bundle";
import { UserMediaType } from "../context/mediaContext/lib/typeConstant";
import { Permissions } from "../context/permissionsContext/lib/typeConstant";
import MediasoupSocketController from "../serverControllers/mediasoupServer/MediasoupSocketController";

class BundlesController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableId: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private userMedia: React.MutableRefObject<UserMediaType>,

    private tableRef: React.RefObject<HTMLDivElement>,
    private tableTopRef: React.RefObject<HTMLDivElement>,

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

    private muteAudio: (
      producerType: "audio" | "screenAudio",
      producerId: string | undefined,
    ) => void,

    private setUpEffectContext: (
      username: string,
      instance: string,
      cameraIds: (string | undefined)[],
      screenIds: (string | undefined)[],
      screenAudioIds: (string | undefined)[],
    ) => void,

    private permissions: React.MutableRefObject<Permissions>,

    private handleDisableEnableBtns: (disabled: boolean) => void,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  createProducerBundle = () => {
    if (this.tableRef.current) {
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
          tableId={this.tableId.current}
          username={this.username.current}
          instance={this.instance.current}
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
          handleDisableEnableBtns={this.handleDisableEnableBtns}
          isAudio={this.isAudio}
          setAudioActive={this.setAudioActive}
          options={{
            isUser: true,
            permissions: this.permissions.current,
          }}
          handleMuteCallback={this.muteAudio}
          tableRef={this.tableRef}
          tableTopRef={this.tableTopRef}
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
    remoteAudioStream: MediaStream | undefined,
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
        Object.keys(remoteScreenAudioStreams),
      );

      const newBundle = (
        <Bundle
          tableId={this.tableId.current}
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
            this.mediasoupSocket.current?.sendMessage({
              type: "requestPermissions",
              header: {
                tableId: this.tableId.current,
                inquiringUsername: this.username.current,
                inquiringInstance: this.instance.current,
                inquiredUsername: trackUsername,
                inquiredInstance: trackInstance,
              },
            });

            this.mediasoupSocket.current?.sendMessage({
              type: "requestBundleMetadata",
              header: {
                tableId: this.tableId.current,
                inquiringUsername: this.username.current,
                inquiringInstance: this.instance.current,
                inquiredUsername: trackUsername,
                inquiredInstance: trackInstance,
              },
            });
          }}
          onNewConsumerWasCreatedCallback={() => {
            this.mediasoupSocket.current?.sendMessage({
              type: "requestClientMuteState",
              header: {
                tableId: this.tableId.current,
                username: this.username.current,
                instance: this.instance.current,
                producerUsername: trackUsername,
                producerInstance: trackInstance,
              },
            });
          }}
          handleDisableEnableBtns={this.handleDisableEnableBtns}
          isAudio={this.isAudio}
          setAudioActive={this.setAudioActive}
          tableRef={this.tableRef}
          tableTopRef={this.tableTopRef}
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

  cleanUpProducerBundle = () => {
    if (
      this.userMedia.current.audio === undefined &&
      Object.keys(this.userMedia.current.camera).length === 0 &&
      Object.keys(this.userMedia.current.screen).length === 0 &&
      Object.keys(this.userMedia.current.screenAudio).length === 0
    ) {
      this.setBundles((prev) => {
        const newBundles = {
          ...prev,
        };

        if (
          newBundles[this.username.current] &&
          newBundles[this.username.current][this.instance.current]
        ) {
          delete newBundles[this.username.current][this.instance.current];
        }

        return newBundles;
      });
    }
  };
}

export default BundlesController;
