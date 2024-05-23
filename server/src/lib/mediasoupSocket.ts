import { Router } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import {
  roomProducerTransports,
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
} from "./mediasoupVars";
import createWorker from "./createWorker";
import { MediasoupSocket } from "./mediasoupTypes";
import onGetRouterRtpCapabilities from "./lib/onGetRouterRtpCapabilities";
import onCreateProducerTransport from "./lib/onCreateProducerTransport";
import onConnectProducerTransport from "./lib/onConnectProducerTransport";
import onCreateConsumerTransport from "./lib/onCreateConsumerTransport";
import onConnectConsumerTransport from "./lib/onConnectConsumerTransport";
import onResume from "./lib/onResume";
import onConsume from "./lib/onConsume";
import onNewConsumer from "./lib/onNewConsumer";
import onRemoveProducer from "./lib/onRemoveProducer";
import onCreateNewProducer from "./lib/onCreateNewProducer";
import onUnsubscribe from "./lib/onUnsubscribe";
import onMuteLock from "./lib/onMuteLock";
import onRequestMuteLock from "./lib/onRequestMuteLock";
import onAcceptMuteLock from "./lib/onAcceptMuteLock";

let mediasoupRouter: Router;

const SocketIOConnection = async (io: SocketIOServer) => {
  try {
    mediasoupRouter = await createWorker();
  } catch (error) {
    throw error;
  }

  io.on("connection", (socket: MediasoupSocket) => {
    socket.on("joinRoom", (roomName: string, username: string) => {
      socket.join(roomName);
      socket.join(`${roomName}_${username}`);

      socket.roomName = roomName;
      socket.username = username;
    });

    socket.on("leaveRoom", (roomName: string, username: string) => {
      socket.leave(roomName);
      socket.leave(`${roomName}_${username}`);

      socket.roomName = "";
      socket.username = "";
    });

    socket.on("disconnect", () => {
      if (socket.roomName && socket.username) {
        socket.leave(socket.roomName);
        socket.leave(`${socket.roomName}_${socket.username}`);

        if (
          roomProducerTransports[socket.roomName] &&
          roomProducerTransports[socket.roomName][socket.username]
        ) {
          delete roomProducerTransports[socket.roomName][socket.username];
        }

        if (
          roomConsumerTransports[socket.roomName] &&
          roomConsumerTransports[socket.roomName][socket.username]
        ) {
          delete roomConsumerTransports[socket.roomName][socket.username];
        }

        if (
          roomProducers[socket.roomName] &&
          roomProducers[socket.roomName][socket.username]
        ) {
          delete roomProducers[socket.roomName][socket.username];
        }

        if (
          roomConsumers[socket.roomName] &&
          roomConsumers[socket.roomName][socket.username]
        ) {
          delete roomConsumers[socket.roomName][socket.username];
        }

        for (const username in roomConsumers[socket.roomName]) {
          for (const producerUsername in roomConsumers[socket.roomName][
            username
          ]) {
            if (
              producerUsername === socket.username &&
              roomConsumers[socket.roomName] &&
              roomConsumers[socket.roomName][username]
            ) {
              delete roomConsumers[socket.roomName][username][socket.username];
            }
          }
        }

        io.to(socket.roomName).emit("userDisconnected", socket.username);
      }
    });

    socket.on("message", (event: any) => {
      switch (event.type) {
        case "getRouterRtpCapabilities":
          onGetRouterRtpCapabilities(socket, mediasoupRouter);
          break;
        case "createProducerTransport":
          onCreateProducerTransport(event, io, mediasoupRouter);
          break;
        case "connectProducerTransport":
          onConnectProducerTransport(event, io);
          break;
        case "createNewProducer":
          onCreateNewProducer(event, socket, io);
          break;
        case "createConsumerTransport":
          onCreateConsumerTransport(event, io, mediasoupRouter);
          break;
        case "connectConsumerTransport":
          onConnectConsumerTransport(event, io);
          break;
        case "resume":
          onResume(event, io);
          break;
        case "consume":
          onConsume(event, io, mediasoupRouter);
          break;
        case "newConsumer":
          onNewConsumer(event, io, mediasoupRouter);
          break;
        case "removeProducer":
          onRemoveProducer(event, io);
          break;
        case "unsubscribe":
          onUnsubscribe(event, io);
          break;
        case "muteLock":
          onMuteLock(event, io);
          break;
        case "requestMuteLock":
          onRequestMuteLock(event, io);
          break;
        case "acceptMuteLock":
          onAcceptMuteLock(event, io);
        default:
          break;
      }
    });
  });
};

export default SocketIOConnection;
