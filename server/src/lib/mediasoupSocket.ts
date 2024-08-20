import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket } from "./mediasoupTypes";
import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
} from "mediasoup/node/lib/types";
import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onResume from "./lib/onResume";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import Mute from "./lib/Mute";
import Effects from "./lib/Effects";
import Tables from "./lib/Tables";
import StatesPermissions from "./lib/StatesPermissions";

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
      producerType: string;
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
      type: "removeProducer";
      table_id: string;
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
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
      producerType: "camera" | "screen" | "audio";
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
      consumerType: string;
    }
  | {
      type: "sendLocalMuteChange";
      table_id: string;
      username: string;
      instance: string;
    }
  | {
      type: "requestEffectChange";
      table_id: string;
      requestedUsername: string;
      requestedInstance: string;
      requestedProducerType: "camera" | "screen" | "audio";
      requestedProducerId: string | undefined;
      effect: string;
      effectStyle: any;
      blockStateChange: boolean;
    }
  | {
      type: "clientEffectChange";
      table_id: string;
      username: string;
      instance: string;
      producerType: "camera" | "screen" | "audio";
      producerId: string | undefined;
      effect: string;
      effectStyle: any;
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
      streamEffects: any;
      currentEffectsStyles: any;
    };

const mediasoupSocket = async (io: SocketIOServer) => {
  io.on("connection", (socket: MediasoupSocket) => {
    const tables = new Tables(socket, io);
    const producers = new Producers(io);
    const consumers = new Consumers(io);
    const mute = new Mute(io);
    const effects = new Effects(io);
    const statesPermissions = new StatesPermissions(io);

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
        case "sendLocalMuteChange":
          mute.onSendLocalMuteChange(event);
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
        default:
          break;
      }
    });
  });
};

export default mediasoupSocket;
