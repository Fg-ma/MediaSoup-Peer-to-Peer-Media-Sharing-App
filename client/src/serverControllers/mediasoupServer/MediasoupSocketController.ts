import ProducersController from "../../lib/ProducersController";
import ConsumersController from "../../lib/ConsumersController";
import PermissionsController from "../../lib/PermissionsController";
import Metadata from "../../lib/Metadata";
import CleanupController from "../../lib/CleanupController";
import {
  IncomingMediasoupMessages,
  OutGoingMediasoupMessages,
} from "./lib/typeConstant";

class MediasoupSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<(message: IncomingMediasoupMessages) => void> =
    new Set();

  constructor(
    private url: string,
    private table_id: string,
    private username: string,
    private instance: string,
    private producersController: React.MutableRefObject<ProducersController>,
    private consumersController: React.MutableRefObject<ConsumersController>,
    private permissionsController: React.MutableRefObject<PermissionsController>,
    private metadata: React.MutableRefObject<Metadata>,
    private cleanupController: React.MutableRefObject<CleanupController>,
  ) {
    this.connect(this.url);
  }

  deconstructor = () => {
    if (this.ws) {
      this.ws.close();
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      this.ws = undefined;
    }

    this.messageListeners.clear();
  };

  private connect = (url: string) => {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      this.handleMessage(message);
      this.messageListeners.forEach((listener) => {
        listener(message as IncomingMediasoupMessages);
      });
    };

    this.ws.onopen = () => {
      this.joinTable();
      this.getRouterRtpCapabilities();
    };
  };

  addMessageListener = (
    listener: (message: IncomingMediasoupMessages) => void,
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingMediasoupMessages) => void,
  ): void => {
    this.messageListeners.delete(listener);
  };

  handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "producerTransportCreated":
        this.producersController.current.onProducerTransportCreated(event);
        break;
      case "consumerTransportCreated":
        this.consumersController.current.onConsumerTransportCreated(event);
        break;
      case "resumed":
        break;
      case "subscribed":
        this.consumersController.current.onSubscribed(event);
        break;
      case "newConsumerSubscribed":
        this.consumersController.current.onNewConsumerSubscribed(event);
        break;
      case "newJSONConsumerSubscribed":
        this.consumersController.current.onNewJSONConsumerSubscribed(event);
        break;
      case "newProducerAvailable":
        this.producersController.current.onNewProducerAvailable(event);
        break;
      case "newJSONProducerAvailable":
        this.producersController.current.onNewJSONProducerAvailable(event);
        break;
      case "producerDisconnected":
        this.producersController.current.onProducerDisconnected(event);
        break;
      case "permissionsRequested":
        this.permissionsController.current.onPermissionsRequested(event);
        break;
      case "bundleMetadataRequested":
        this.metadata.current.onBundleMetadataRequested(event);
        break;
      case "requestedCatchUpData":
        this.metadata.current.onRequestedCatchUpData(event);
        break;
      case "removeProducerRequested":
        this.producersController.current.onRemoveProducerRequested(event);
        break;
      case "userLeftTable":
        this.cleanupController.current.handleUserLeftCleanup(
          event.header.username,
          event.header.instance,
        );
        break;
      default:
        break;
    }
  };

  sendMessage = (message: OutGoingMediasoupMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  getRouterRtpCapabilities = () => {
    this.sendMessage({
      type: "getRouterRtpCapabilities",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };
}

export default MediasoupSocketController;
