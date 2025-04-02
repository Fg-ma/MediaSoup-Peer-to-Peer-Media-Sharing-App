import { types } from "mediasoup-client";
import {
  RemoteMediaType,
  UserDataStreamsType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import {
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../../universal/effectsTypeConstant";
import GamesSignalingMedia from "../../media/games/GamesSignalingMedia";
import BundlesController from "../../lib/BundlesController";
import onRouterCapabilities from "../../lib/onRouterCapabilities";
import TableSocketController from "../../serverControllers/tableServer/TableSocketController";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import { IncomingMediasoupMessages } from "../../serverControllers/mediasoupServer/lib/typeConstant";
import ProducersController from "../../lib/ProducersController";
import ConsumersController from "../../lib/ConsumersController";
import PermissionsController from "../../lib/PermissionsController";
import Metadata from "../../lib/Metadata";
import CleanupController from "../../lib/CleanupController";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../lib/UserDevice";

class JoinTableSectionController {
  constructor(
    private tableSocket: React.MutableRefObject<
      TableSocketController | undefined
    >,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableIdRef: React.RefObject<HTMLInputElement>,
    private usernameRef: React.RefObject<HTMLInputElement>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private setIsInTable: React.Dispatch<React.SetStateAction<boolean>>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private handleDisableEnableBtns: (disabled: boolean) => void,
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
    private bundlesController: BundlesController,
    private producersController: ProducersController,
    private consumersController: ConsumersController,
    private permissionsController: PermissionsController,
    private metadata: Metadata,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private cleanupController: CleanupController,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
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
        this.leaveTable();
      }

      this.tableSocket.current = new TableSocketController(
        "wss://localhost:8043",
        this.table_id.current,
        this.username.current,
        this.instance.current
      );

      this.tableStaticContentSocket.current =
        new TableStaticContentSocketController(
          "wss://localhost:8045",
          this.table_id.current,
          this.username.current,
          this.instance.current,
          this.userMedia,
          this.userEffects,
          this.userEffectsStyles,
          this.userDevice,
          this.deadbanding
        );

      this.userMedia.current.gamesSignaling = new GamesSignalingMedia(
        this.table_id.current,
        this.username.current,
        this.instance.current,
        "wss://localhost:8042",
        this.userMedia,
        this.bundlesController
      );

      this.mediasoupSocket.current = new MediasoupSocketController(
        "wss://localhost:8000",
        this.table_id.current,
        this.username.current,
        this.instance.current,
        this.producersController,
        this.consumersController,
        this.permissionsController,
        this.metadata,
        this.cleanupController
      );

      this.setIsInTable(true);

      this.setRerender((prev) => !prev);
    }
  };

  private leaveTable = () => {
    this.tableSocket.current?.deconstructor();
    this.tableSocket.current = undefined;
    this.tableStaticContentSocket.current?.deconstructor();
    this.tableStaticContentSocket.current = undefined;
    this.mediasoupSocket.current?.deconstructor();
    this.mediasoupSocket.current = undefined;

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

      this.mediasoupSocket.current?.sendMessage({
        type: "unsubscribe",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
      });
    }
  };

  private removePositionScaleRotationProducer = () => {
    if (this.userDataStreams.current.positionScaleRotation) {
      this.userDataStreams.current.positionScaleRotation.close();
      delete this.userDataStreams.current.positionScaleRotation;
    }

    this.mediasoupSocket.current?.sendMessage({
      type: "removeProducer",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType: "json",
        dataStreamType: "positionScaleRotation",
      },
    });
  };

  private subscribe = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.isSubscribed.current = !this.isSubscribed.current;

    if (this.isSubscribed.current) {
      this.mediasoupSocket.current?.sendMessage({
        type: "createConsumerTransport",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
      });
    }
  };

  private createProducerTransport = () => {
    this.mediasoupSocket.current?.sendMessage({
      type: "createProducerTransport",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
      },
    });
  };

  handleMediasoupSocketMessage = async (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "routerCapabilities":
        await onRouterCapabilities(event, this.device);

        this.subscribe();
        this.createProducerTransport();
        break;
      default:
        break;
    }
  };
}

export default JoinTableSectionController;
