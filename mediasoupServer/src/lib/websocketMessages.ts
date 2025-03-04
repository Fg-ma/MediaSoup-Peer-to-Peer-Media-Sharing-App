import onGetRouterRtpCapabilities from "./onGetRouterRtpCapabilities";
import onResume from "./onResume";
import { MediasoupSocketEvents, MediasoupWebSocket } from "../typeConstant";
import {
  broadcaster,
  consumersController,
  effectsController,
  metadataController,
  muteController,
  producersController,
  statesPermissionsController,
  tables,
} from "../index";

const handleMessage = async (
  ws: MediasoupWebSocket,
  event: MediasoupSocketEvents
) => {
  switch (event.type) {
    case "joinTable":
      tables.joinTable(ws, event);
      break;
    case "getRouterRtpCapabilities":
      onGetRouterRtpCapabilities(event);
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
    case "clientClearEffects":
      effectsController.onClientClearEffects(event);
      break;
    case "requestClearEffects":
      effectsController.onRequestClearEffects(event);
      break;
    default:
      break;
  }
};

export default handleMessage;
