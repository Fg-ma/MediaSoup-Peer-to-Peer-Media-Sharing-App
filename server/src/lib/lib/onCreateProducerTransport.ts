import { Router, RtpCapabilities } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomProducerTransports } from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";

const onCreateProducerTransport = async (
  event: {
    type: string;
    forceTcp: boolean;
    rtpCapabilities: RtpCapabilities;
    producerType: string;
    roomName: string;
    username: string;
  },
  io: SocketIOServer,
  mediasoupRouter: Router
) => {
  try {
    if (
      !roomProducerTransports[event.roomName] ||
      !roomProducerTransports[event.roomName][event.username]
    ) {
      const { transport, params } = await createWebRtcTransport(
        mediasoupRouter
      );
      if (!roomProducerTransports[event.roomName]) {
        roomProducerTransports[event.roomName] = {};
      }

      roomProducerTransports[event.roomName][event.username] = transport;
      io.to(`${event.roomName}_${event.username}`).emit("message", {
        type: "producerTransportCreated",
        params: params,
      });
    } else if (
      roomProducerTransports[event.roomName] &&
      roomProducerTransports[event.roomName][event.username]
    ) {
      const msg = {
        type: "newProducer",
        producerType: event.producerType,
      };
      io.to(`${event.roomName}_${event.username}`).emit("message", msg);
    }
  } catch (error) {
    console.error(error);
    io.to(`${event.roomName}_${event.username}`).emit("message", {
      type: "producerTransportCreated",
      error,
    });
  }
};

export default onCreateProducerTransport;
