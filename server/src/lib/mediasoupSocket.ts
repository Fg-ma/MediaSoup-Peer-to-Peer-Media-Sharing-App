import { Server as SocketIOServer } from "socket.io";
import {
  roomProducerTransports,
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
  workersMap,
} from "./mediasoupVars";
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
import onDeleteProducerTransport from "./lib/onDeleteProducerTransport";
import onNewProducerCreated from "./lib/onNewProducerCreated";
import onNewConsumerCreated from "./lib/onNewConsumerCreated";
import onSendMuteRequest from "./lib/onSendMuteRequest";
import { releaseWorker } from "./workerManager";
import onRequestEffect from "./lib/onRequestEffect";

const SocketIOConnection = async (io: SocketIOServer) => {
  io.on("connection", (socket: MediasoupSocket) => {
    socket.on("joinTable", (table_id: string, username: string) => {
      socket.join(table_id);
      socket.join(`${table_id}_${username}`);

      socket.table_id = table_id;
      socket.username = username;
    });

    socket.on("leaveTable", (table_id: string, username: string) => {
      socket.leave(table_id);
      socket.leave(`${table_id}_${username}`);

      socket.table_id = "";
      socket.username = "";

      if (
        roomProducerTransports[table_id] &&
        roomProducerTransports[table_id][username]
      ) {
        delete roomProducerTransports[table_id][username];
      }

      if (
        roomConsumerTransports[table_id] &&
        roomConsumerTransports[table_id][username]
      ) {
        delete roomConsumerTransports[table_id][username];
      }

      if (
        (!roomProducerTransports ||
          (roomProducerTransports[table_id] &&
            Object.keys(roomProducerTransports[table_id]).length === 0)) &&
        (!roomConsumerTransports ||
          (roomConsumerTransports[table_id] &&
            Object.keys(roomConsumerTransports[table_id]).length === 0))
      ) {
        releaseWorker(workersMap[table_id]);
        delete workersMap[table_id];
      }

      if (roomProducers[table_id] && roomProducers[table_id][username]) {
        delete roomProducers[table_id][username];
      }

      if (roomConsumers[table_id] && roomConsumers[table_id][username]) {
        delete roomConsumers[table_id][username];
      }

      for (const username in roomConsumers[table_id]) {
        for (const producerUsername in roomConsumers[table_id][username]) {
          if (
            producerUsername === username &&
            roomConsumers[table_id] &&
            roomConsumers[table_id][username]
          ) {
            delete roomConsumers[table_id][username][username];
          }
        }
      }

      io.to(table_id).emit("userLeftTable", username);
    });

    socket.on("disconnect", () => {
      if (socket.table_id && socket.username) {
        socket.leave(socket.table_id);
        socket.leave(`${socket.table_id}_${socket.username}`);

        if (
          roomProducerTransports[socket.table_id] &&
          roomProducerTransports[socket.table_id][socket.username]
        ) {
          delete roomProducerTransports[socket.table_id][socket.username];
        }

        if (
          roomConsumerTransports[socket.table_id] &&
          roomConsumerTransports[socket.table_id][socket.username]
        ) {
          delete roomConsumerTransports[socket.table_id][socket.username];
        }

        if (
          (!roomProducerTransports ||
            (roomProducerTransports[socket.table_id] &&
              Object.keys(roomProducerTransports[socket.table_id]).length ===
                0)) &&
          (!roomConsumerTransports ||
            (roomConsumerTransports[socket.table_id] &&
              Object.keys(roomConsumerTransports[socket.table_id]).length ===
                0))
        ) {
          releaseWorker(workersMap[socket.table_id]);
          delete workersMap[socket.table_id];
        }

        if (
          roomProducers[socket.table_id] &&
          roomProducers[socket.table_id][socket.username]
        ) {
          delete roomProducers[socket.table_id][socket.username];
        }

        if (
          roomConsumers[socket.table_id] &&
          roomConsumers[socket.table_id][socket.username]
        ) {
          delete roomConsumers[socket.table_id][socket.username];
        }

        for (const username in roomConsumers[socket.table_id]) {
          for (const producerUsername in roomConsumers[socket.table_id][
            username
          ]) {
            if (
              producerUsername === socket.username &&
              roomConsumers[socket.table_id] &&
              roomConsumers[socket.table_id][username]
            ) {
              delete roomConsumers[socket.table_id][username][socket.username];
            }
          }
        }

        io.to(socket.table_id).emit("userDisconnected", socket.username);
      }
    });

    socket.on("message", (event: any) => {
      switch (event.type) {
        case "getRouterRtpCapabilities":
          onGetRouterRtpCapabilities(event, io);
          break;
        case "createProducerTransport":
          onCreateProducerTransport(event, io);
          break;
        case "connectProducerTransport":
          onConnectProducerTransport(event, io);
          break;
        case "createNewProducer":
          onCreateNewProducer(event, socket, io);
          break;
        case "createConsumerTransport":
          onCreateConsumerTransport(event, io);
          break;
        case "connectConsumerTransport":
          onConnectConsumerTransport(event, io);
          break;
        case "resume":
          onResume(event, io);
          break;
        case "consume":
          onConsume(event, io);
          break;
        case "newConsumer":
          onNewConsumer(event, io);
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
          break;
        case "deleteProducerTransport":
          onDeleteProducerTransport(event);
          break;
        case "newProducerCreated":
          onNewProducerCreated(event, io);
          break;
        case "newConsumerCreated":
          onNewConsumerCreated(event, io);
          break;
        case "sendMuteRequest":
          onSendMuteRequest(event, io);
          break;
        case "requestEffect":
          onRequestEffect(event, io);
          break;
        default:
          break;
      }
    });
  });
};

export default SocketIOConnection;
