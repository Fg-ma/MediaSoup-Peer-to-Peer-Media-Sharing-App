import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onResume from "./lib/onResume";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import MuteController from "./lib/MuteController";
import EffectsController from "./lib/EffectsController";
import Tables from "./lib/Tables";
import StatesPermissionsController from "./lib/StatesPermissionsController";
import MetadataController from "./lib/MetadataController";
import { MediasoupSocketEvents, MediasoupWebSocket } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import MediasoupCleanup from "./lib/MediasoupCleanup";

const broadcaster = new Broadcaster();
const mediasoupCleanup = new MediasoupCleanup();
const tables = new Tables(broadcaster, mediasoupCleanup);
const producersController = new ProducersController(
  broadcaster,
  mediasoupCleanup
);
const consumersController = new ConsumersController(
  broadcaster,
  mediasoupCleanup
);
const muteController = new MuteController(broadcaster);
const effectsController = new EffectsController(broadcaster);
const statesPermissionsController = new StatesPermissionsController(
  broadcaster
);
const metadataController = new MetadataController(broadcaster);

const mediasoupSocket = async (
  mediasoupWS: MediasoupWebSocket,
  event: MediasoupSocketEvents
) => {
  switch (event.type) {
    case "joinTable":
      tables.joinTable(mediasoupWS, event);
      break;
    case "getRouterRtpCapabilities":
      onGetRouterRtpCapabilities(broadcaster, event);
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
      onResume(broadcaster, event);
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
};

export const leaveTable = (
  table_id: string,
  username: string,
  instance: string
) => {
  tables.leaveTable(table_id, username, instance);
};

export default mediasoupSocket;
