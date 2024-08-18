import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket } from "./mediasoupTypes";
import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onResume from "./lib/onResume";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import Mute from "./lib/Mute";
import Effects from "./lib/Effects";
import Tables from "./lib/Tables";

const mediasoupSocket = async (io: SocketIOServer) => {
  io.on("connection", (socket: MediasoupSocket) => {
    const tables = new Tables(socket, io);
    const producers = new Producers(io);
    const consumers = new Consumers(io);
    const mute = new Mute(io);
    const effects = new Effects(io);

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

    socket.on("message", (event: any) => {
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
        case "requestClientMuteState":
          mute.onRequestClientMuteState(event);
          break;
        case "clientMuteStateResponse":
          mute.onClientMuteStateResponse(event);
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
        case "requestEffect":
          effects.onRequestEffect(event);
          break;
        default:
          break;
      }
    });
  });
};

export default mediasoupSocket;
