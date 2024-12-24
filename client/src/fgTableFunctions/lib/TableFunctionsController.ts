import { types } from "mediasoup-client";
import { Socket } from "socket.io-client";
import {
  RemoteMediaType,
  UserDataStreamsType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import GamesSignalingMedia from "../../lib/GamesSignalingMedia";
import BundlesController from "../../lib/BundlesController";

class TableFunctionsController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private tableIdRef: React.RefObject<HTMLInputElement>,
    private usernameRef: React.RefObject<HTMLInputElement>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private setIsInTable: React.Dispatch<React.SetStateAction<boolean>>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private handleDisableEnableBtns: (disabled: boolean) => void,
    private bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,
    private consumerTransport: React.MutableRefObject<
      types.Transport<types.AppData> | undefined
    >,
    private producerTransport: React.MutableRefObject<
      types.Transport<types.AppData> | undefined
    >,
    private isCamera: React.MutableRefObject<boolean>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setMutedAudio: React.Dispatch<React.SetStateAction<boolean>>,
    private mutedAudioRef: React.MutableRefObject<boolean>,
    private isSubscribed: React.MutableRefObject<boolean>,
    private device: React.MutableRefObject<types.Device | undefined>,
    private bundlesController: BundlesController
  ) {}

  joinTable = () => {
    const previousTableId = this.table_id.current;
    const previousUsername = this.username.current;

    if (
      this.table_id.current === this.tableIdRef.current?.value &&
      this.username.current === this.usernameRef.current?.value
    ) {
      return;
    }

    if (this.tableIdRef.current) {
      this.table_id.current = this.tableIdRef.current?.value;
    }
    if (this.usernameRef.current) {
      this.username.current = this.usernameRef.current?.value;
    }
    if (
      this.table_id.current.trim() !== "" &&
      this.username.current.trim() !== ""
    ) {
      // Leave previous table if there is one
      if (previousTableId.trim() !== "" && previousUsername.trim() !== "") {
        this.socket.current.emit(
          "leaveTable",
          previousTableId,
          previousUsername,
          this.instance.current
        );
        this.leaveTable();
      }

      this.userMedia.current.gamesSignaling = new GamesSignalingMedia(
        this.table_id.current,
        this.username.current,
        this.instance.current,
        "ws://localhost:8042",
        this.userMedia,
        this.bundles,
        this.bundlesController
      );

      // Join new table
      this.socket.current.emit(
        "joinTable",
        this.table_id.current,
        this.username.current,
        this.instance.current
      );
      this.setIsInTable(true);

      const msg = {
        type: "getRouterRtpCapabilities",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
      };
      this.socket.current.emit("message", msg);
    }
  };

  private leaveTable = () => {
    this.unsubscribe();

    this.removePositionScaleRotationProducer();

    for (const cameraId in this.userMedia.current.camera) {
      this.userMedia.current.camera[cameraId].deconstructor();
      delete this.userMedia.current.camera[cameraId];
    }

    for (const screenId in this.userMedia.current.screen) {
      this.userMedia.current.screen[screenId].deconstructor();
      delete this.userMedia.current.screen[screenId];
    }

    for (const screenAudioId in this.userMedia.current.screenAudio) {
      this.userMedia.current.screenAudio[screenAudioId].deconstructor();
      delete this.userMedia.current.screenAudio[screenAudioId];
    }

    if (this.userMedia.current.audio) {
      this.userMedia.current.audio.deconstructor();
      this.userMedia.current.audio = undefined;
    }

    if (this.userMedia.current.gamesSignaling) {
      this.userMedia.current.gamesSignaling.deconstructor();
      this.userMedia.current.gamesSignaling = undefined;
    }

    this.remoteMedia.current = {};

    this.handleDisableEnableBtns(false);
    this.device.current = undefined;
    this.setBundles({});
    this.consumerTransport.current?.close();
    this.consumerTransport.current = undefined;
    this.producerTransport.current?.close();
    this.producerTransport.current = undefined;
    this.isCamera.current = false;
    this.setCameraActive(false);
    this.isScreen.current = false;
    this.setScreenActive(false);
    this.isAudio.current = false;
    this.setAudioActive(false);
    this.setMutedAudio(false);
    this.mutedAudioRef.current = false;
    this.isSubscribed.current = false;
    this.setIsInTable(false);
  };

  subscribe = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.isSubscribed.current = !this.isSubscribed.current;

    if (this.isSubscribed.current) {
      const msg = {
        type: "createConsumerTransport",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
      };

      this.socket.current.send(msg);
    }
  };

  private unsubscribe = () => {
    this.isSubscribed.current = !this.isSubscribed.current;

    if (!this.isSubscribed.current) {
      this.setBundles((prev) => {
        const previousBundles = { ...prev };

        for (const bundleUsername in previousBundles) {
          if (bundleUsername !== this.username.current) {
            delete previousBundles[bundleUsername];
          } else {
            for (const bundleInstance in previousBundles[bundleUsername]) {
              if (bundleInstance !== this.instance.current) {
                delete previousBundles[bundleUsername][bundleInstance];
              }
            }
          }
        }
        return previousBundles;
      });
      this.remoteMedia.current = {};

      const msg = {
        type: "unsubscribe",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
      };
      this.socket.current.emit("message", msg);
    }
  };

  createProducerTransport = () => {
    const msg = {
      type: "createProducerTransport",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
      },
    };
    this.socket.current.emit("message", msg);
  };

  private removePositionScaleRotationProducer = () => {
    if (this.userDataStreams.current.positionScaleRotation) {
      this.userDataStreams.current.positionScaleRotation.close();
      delete this.userDataStreams.current.positionScaleRotation;
    }

    // Remove positionRotationScale producer
    const message = {
      type: "removeProducer",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType: "json",
        dataStreamType: "positionScaleRotation",
      },
    };
    this.socket.current.emit("message", message);
  };
}

export default TableFunctionsController;
