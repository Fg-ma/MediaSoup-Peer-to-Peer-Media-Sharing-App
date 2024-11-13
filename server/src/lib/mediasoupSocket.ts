import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket } from "./mediasoupTypes";
import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
  SctpCapabilities,
} from "mediasoup/node/lib/types";
import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onResume from "./lib/onResume";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import Mute from "./lib/Mute";
import Effects from "./lib/Effects";
import Tables from "./lib/Tables";
import StatesPermissions from "./lib/StatesPermissions";
import FgMetaData from "./lib/FgMetaData";
import { ProducerTypes } from "./lib/typeConstant";
import { SctpParameters } from "mediasoup/node/lib/fbs/sctp-parameters";
import { DataStreamTypes } from "./mediasoupVars";

type MediasoupSocketEvents =
  | {
      type: "getRouterRtpCapabilities";
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "createProducerTransport";
      forceTcp: boolean;
      rtpCapabilities: RtpCapabilities;
      producerType: ProducerTypes;
      table_id: string;
      username: string;
      instance: number;
    }
  | {
      type: "connectProducerTransport";
      dtlsParameters: DtlsParameters;
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "createNewProducer";
      producerType: "camera" | "screen" | "audio";
      transportId: string;
      kind: MediaKind;
      rtpParameters: RtpParameters;
      table_id: string;
      username: string;
      instance: string;
      producerId?: string;
    }
  | {
      type: "createNewJSONProducer";
      producerType: "json";
      transportId: string;
      label: string;
      protocol: "json";
      table_id: string;
      username: string;
      instance: string;
      producerId: string;
      sctpStreamParameters: SctpParameters;
      dataStreamType: DataStreamTypes;
    }
  | {
      type: "createConsumerTransport";
      forceTcp: boolean;
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "connectConsumerTransport";
      transportId: string;
      dtlsParameters: DtlsParameters;
      table_id: string;
      username: string;
      instance: string;
    }
  | { type: "resume"; table_id: string; username: string; instance: string }
  | {
      type: "consume";
      rtpCapabilities: RtpCapabilities;
      table_id: string;
      username: string;
      instance: string;
      producerId?: string;
    }
  | {
      type: "newConsumer";
      consumerType: "camera" | "screen" | "audio";
      rtpCapabilities: RtpCapabilities;
      producerUsername: string;
      producerInstance: string;
      incomingProducerId?: string;
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "newJSONConsumer";
      consumerType: "json";
      sctpCapabilities: SctpCapabilities;
      producerUsername: string;
      producerInstance: string;
      incomingProducerId: string;
      table_id: string;
      username: string;
      instance: string;
      dataStreamType: DataStreamTypes;
    }
  | {
      type: "removeProducer";
      table_id: string;
      username: string;
      instance: string;
      producerType: ProducerTypes;
      producerId?: string;
    }
  | {
      type: "unsubscribe";
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "clientMute";
      table_id: string;
      username: string;
      instance: string;
      clientMute: boolean;
    }
  | {
      type: "deleteProducerTransport";
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "newProducerCreated";
      table_id: string;
      username: string;
      instance: string;
      producerType: ProducerTypes;
      producerId: string | undefined;
    }
  | {
      type: "newConsumerCreated";
      table_id: string;
      username: string;
      instance: string;
      producerUsername: string;
      producerInstance: string;
      consumerId?: string;
      consumerType: ProducerTypes;
    }
  | {
      type: "requestEffectChange";
      table_id: string;
      requestedUsername: string;
      requestedInstance: string;
      requestedProducerType: ProducerTypes;
      requestedProducerId: string | undefined;
      effect: string;
      blockStateChange: boolean;
      data: {
        style: string;
        hideBackgroundStyle?: string;
        hideBackgroundColor?: string;
        postProcessStyle?: string;
      };
    }
  | {
      type: "clientEffectChange";
      table_id: string;
      username: string;
      instance: string;
      producerType: ProducerTypes;
      producerId: string | undefined;
      effect: string;
      effectStyle: string;
      blockStateChange: boolean;
    }
  | {
      type: "requestStatesPermissions";
      table_id: string;
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredUsername: string;
      inquiredInstance: string;
    }
  | {
      type: "statesPermissionsResponse";
      table_id: string;
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredUsername: string;
      inquiredInstance: string;
      clientMute: boolean;
      cameraPermission: boolean;
      screenPermission: boolean;
      audioPermission: boolean;
      streamEffects: string;
      currentEffectsStyles: string;
    }
  | {
      type: "requestCatchUpData";
      table_id: string;
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredUsername: string;
      inquiredInstance: string;
      inquiredType: ProducerTypes;
      inquiredVideoId: string;
    }
  | {
      type: "responseCatchUpData";
      table_id: string;
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredUsername: string;
      inquiredInstance: string;
      inquiredType: ProducerTypes;
      inquiredVideoId: string;
      data:
        | {
            cameraPaused: boolean;
            cameraTimeEllapsed: number;
          }
        | {
            screenPaused: boolean;
            screenTimeEllapsed: number;
          }
        | undefined;
    };

const mediasoupSocket = async (io: SocketIOServer) => {
  io.on("connection", (socket: MediasoupSocket) => {
    const tables = new Tables(socket, io);
    const producers = new Producers(io);
    const consumers = new Consumers(io);
    const mute = new Mute(io);
    const effects = new Effects(io);
    const statesPermissions = new StatesPermissions(io);
    const fgMetaData = new FgMetaData(io);

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
          producers.onCreateProducerTransport(event);
          break;
        case "connectProducerTransport":
          producers.onConnectProducerTransport(event);
          break;
        case "createNewProducer":
          producers.onCreateNewProducer(event);
          break;
        case "createNewJSONProducer":
          producers.onCreateNewJSONProducer(event);
          break;
        case "createConsumerTransport":
          consumers.onCreateConsumerTransport(event);
          break;
        case "connectConsumerTransport":
          consumers.onConnectConsumerTransport(event);
          break;
        case "resume":
          onResume(event, io);
          break;
        case "consume":
          consumers.onConsume(event);
          break;
        case "newConsumer":
          consumers.onNewConsumer(event);
          break;
        case "newJSONConsumer":
          consumers.onNewJSONConsumer(event);
          break;
        case "removeProducer":
          producers.onRemoveProducer(event);
          break;
        case "unsubscribe":
          consumers.onUnsubscribe(event);
          break;
        case "clientMute":
          mute.onClientMute(event);
          break;
        case "deleteProducerTransport":
          producers.onDeleteProducerTransport(event);
          break;
        case "newProducerCreated":
          producers.onNewProducerCreated(event);
          break;
        case "newConsumerCreated":
          consumers.onNewConsumerCreated(event);
          break;
        case "requestEffectChange":
          effects.onRequestEffectChange(event);
          break;
        case "clientEffectChange":
          effects.onClientEffectChange(event);
          break;
        case "requestStatesPermissions":
          statesPermissions.onRequestStatesPermissions(event);
          break;
        case "statesPermissionsResponse":
          statesPermissions.onStatesPermissionsResponse(event);
          break;
        case "requestCatchUpData":
          fgMetaData.onRequestCatchUpData(event);
          break;
        case "responseCatchUpData":
          fgMetaData.onResponseCatchUpData(event);
          break;
        default:
          break;
      }
    });
  });
};

export default mediasoupSocket;
