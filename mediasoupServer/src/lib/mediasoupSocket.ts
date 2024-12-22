import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket, MediasoupSocketEvents } from "./mediasoupTypes";
import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onResume from "./lib/onResume";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import MuteController from "./lib/MuteController";
import EffectsController from "./lib/EffectsController";
import Tables from "./lib/Tables";
import StatesPermissionsController from "./lib/StatesPermissionsController";
import MetadataController from "./lib/MetadataController";

const mediasoupSocket = async (io: SocketIOServer) => {
  io.on("connection", (socket: MediasoupSocket) => {
    const tables = new Tables(socket, io);
    const producersController = new ProducersController(io);
    const consumersController = new ConsumersController(io);
    const muteController = new MuteController(io);
    const effectsController = new EffectsController(io);
    const statesPermissionsController = new StatesPermissionsController(io);
    const metadataController = new MetadataController(io);

    socket.on(
      "joinTable",
      (table_id: string, username: string, instance: string) =>
        tables.join(table_id, username, instance)
    );

    socket.on(
      "leaveTable",
      (table_id: string, username: string, instance: string) =>
        tables.leave(table_id, username, instance)
    );

    socket.on("disconnect", () => tables.disconnect());

    socket.on("message", (event: MediasoupSocketEvents) => {
      switch (event.type) {
        case "getRouterRtpCapabilities":
          onGetRouterRtpCapabilities(event, io);
          break;
        case "createProducerTransport":
          producersController.onCreateProducerTransport(event);
          break;
        case "connectProducerTransport":
          producersController.onConnectProducerTransport(event);
          break;
        case "createNewProducer":
          producersController.onCreateNewProducer(event);
          break;
        case "createNewJSONProducer":
          producersController.onCreateNewJSONProducer(event);
          break;
        case "createConsumerTransport":
          consumersController.onCreateConsumerTransport(event);
          break;
        case "connectConsumerTransport":
          consumersController.onConnectConsumerTransport(event);
          break;
        case "resume":
          onResume(event, io);
          break;
        case "consume":
          consumersController.onConsume(event);
          break;
        case "newConsumer":
          consumersController.onNewConsumer(event);
          break;
        case "newJSONConsumer":
          consumersController.onNewJSONConsumer(event);
          break;
        case "removeProducer":
          producersController.onRemoveProducer(event);
          break;
        case "unsubscribe":
          consumersController.onUnsubscribe(event);
          break;
        case "clientMute":
          muteController.onClientMute(event);
          break;
        case "newProducerCreated":
          producersController.onNewProducerCreated(event);
          break;
        case "newConsumerCreated":
          consumersController.onNewConsumerCreated(event);
          break;
        case "requestEffectChange":
          effectsController.onRequestEffectChange(event);
          break;
        case "clientEffectChange":
          effectsController.onClientEffectChange(event);
          break;
        case "requestPermissions":
          statesPermissionsController.onRequestPermissions(event);
          break;
        case "requestBundleMetadata":
          metadataController.onRequestBundleMetadata(event);
          break;
        case "permissionsResponse":
          statesPermissionsController.onPermissionsResponse(event);
          break;
        case "bundleMetadataResponse":
          metadataController.onBundleMetadataResponse(event);
          break;
        case "requestCatchUpData":
          metadataController.onRequestCatchUpData(event);
          break;
        case "requestGameCatchUpData":
          metadataController.onRequestGameCatchUpData(event);
          break;
        case "responseCatchUpData":
          metadataController.onResponseCatchUpData(event);
          break;
        case "responseGameCatchUpData":
          metadataController.onResponseGameCatchUpData(event);
          break;
        case "clientMixEffectActivityChange":
          effectsController.onClientMixEffectActivityChange(event);
          break;
        case "requestMixEffectActivityChange":
          effectsController.onRequestMixEffectActivityChange(event);
          break;
        case "clientMixEffectValueChange":
          effectsController.onClientMixEffectValueChange(event);
          break;
        case "requestMixEffectValueChange":
          effectsController.onRequestMixEffectValueChange(event);
          break;
        case "requestRemoveProducer":
          producersController.onRequestRemoveProducer(event);
          break;
        default:
          break;
      }
    });
  });
};

export default mediasoupSocket;
