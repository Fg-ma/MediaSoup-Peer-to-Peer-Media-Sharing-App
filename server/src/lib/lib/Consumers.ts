import { Server as SocketIOServer } from "socket.io";
import { DtlsParameters } from "mediasoup/node/lib/types";
import { RtpCapabilities, Consumer } from "mediasoup/node/lib/types";
import {
  roomConsumerTransports,
  roomProducerTransports,
  roomConsumers,
  roomProducers,
  workersMap,
} from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import createConsumer from "../createConsumer";
import { getNextWorker, getWorkerByIdx, releaseWorker } from "../workerManager";

class Consumers {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async onCreateConsumerTransport(event: {
    type: string;
    forceTcp: boolean;
    table_id: string;
    username: string;
  }) {
    try {
      // Get the next available worker and router if one doesn't already exist
      let mediasoupRouter;
      if (!workersMap[event.table_id]) {
        const { router, workerIdx } = getNextWorker();
        workersMap[event.table_id] = workerIdx;
        mediasoupRouter = router;
      } else {
        const { router } = getWorkerByIdx(workersMap[event.table_id]);
        mediasoupRouter = router;
      }

      const { transport, params } = await createWebRtcTransport(
        mediasoupRouter
      );

      if (!roomConsumerTransports[event.table_id]) {
        roomConsumerTransports[event.table_id] = {};
      }

      roomConsumerTransports[event.table_id][event.username] = {
        transport,
        isConnected: false,
      };

      this.io.to(`${event.table_id}_${event.username}`).emit("message", {
        type: "consumerTransportCreated",
        params: params,
      });
    } catch (error) {
      console.error(error);
      this.io.to(`${event.table_id}_${event.username}`).emit("error", error);
    }
  }

  async onConnectConsumerTransport(event: {
    type: string;
    transportId: string;
    dtlsParameters: DtlsParameters;
    table_id: string;
    username: string;
  }) {
    if (
      !roomConsumerTransports[event.table_id] ||
      !roomConsumerTransports[event.table_id][event.username]
    ) {
      console.error("No consumer transport found for: ", event.username);
      return;
    }

    if (!roomConsumerTransports[event.table_id][event.username].isConnected) {
      await roomConsumerTransports[event.table_id][
        event.username
      ].transport.connect({
        dtlsParameters: event.dtlsParameters,
      });
      roomConsumerTransports[event.table_id][event.username].isConnected = true;
    }

    this.io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "consumerTransportConnected",
      data: "consumer transport connected",
    });
  }

  async onConsume(event: {
    type: string;
    rtpCapabilities: RtpCapabilities;
    table_id: string;
    username: string;
    producerId?: string;
  }) {
    // Get the next available worker and router
    const { router: mediasoupRouter } = getWorkerByIdx(
      workersMap[event.table_id]
    );

    const consumers = await createConsumer(
      event.table_id,
      event.username,
      roomProducers[event.table_id],
      event.rtpCapabilities,
      mediasoupRouter
    );

    if (!roomConsumers[event.table_id]) {
      roomConsumers[event.table_id] = {};
    }
    if (consumers) {
      roomConsumers[event.table_id][event.username] = consumers;
    } else {
      if (roomConsumers[event.table_id][event.username]) {
        delete roomConsumers[event.table_id][event.username];
      }
    }

    let newConsumers: {
      [username: string]: {
        camera?: {
          [cameraId: string]: {
            producerId: string;
            id: string;
            kind: string;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screen?: {
          [screenId: string]: {
            producerId: string;
            id: string;
            kind: string;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        audio?: {
          producerId: string;
          id: string;
          kind: string;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
    } = {};

    for (const producerUsername in consumers) {
      if (consumers[producerUsername].camera) {
        if (!newConsumers[producerUsername]) {
          newConsumers[producerUsername] = {};
        }
        if (!newConsumers[producerUsername].camera) {
          newConsumers[producerUsername].camera = {};
        }
        for (const cameraId in consumers[producerUsername].camera) {
          const camera = consumers[producerUsername].camera?.[cameraId];
          if (camera) {
            newConsumers[producerUsername].camera![cameraId] = {
              producerId: camera.producerId,
              id: camera.id,
              kind: camera.kind,
              rtpParameters: camera.rtpParameters,
              type: camera.type,
              producerPaused: camera.producerPaused,
            };
          }
        }
      }

      if (consumers[producerUsername].screen) {
        if (!newConsumers[producerUsername]) {
          newConsumers[producerUsername] = {};
        }
        if (!newConsumers[producerUsername].screen) {
          newConsumers[producerUsername].screen = {};
        }
        for (const screenId in consumers[producerUsername].screen) {
          const screen = consumers[producerUsername].screen?.[screenId];
          if (screen)
            newConsumers[producerUsername].screen![screenId] = {
              producerId: screen.producerId,
              id: screen.id,
              kind: screen.kind,
              rtpParameters: screen.rtpParameters,
              type: screen.type,
              producerPaused: screen.producerPaused,
            };
        }
      }

      if (consumers[producerUsername].audio) {
        const audioConsumerData = consumers[producerUsername].audio;

        if (!newConsumers[producerUsername]) {
          newConsumers[producerUsername] = {};
        }
        newConsumers[producerUsername].audio = {
          producerId: audioConsumerData!.producerId,
          id: audioConsumerData!.id,
          kind: audioConsumerData!.kind,
          rtpParameters: audioConsumerData!.rtpParameters,
          type: audioConsumerData!.type,
          producerPaused: audioConsumerData!.producerPaused,
        };
      }
    }

    this.io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "subscribed",
      data: newConsumers,
    });
  }

  async onNewConsumer(event: {
    type: string;
    consumerType: string;
    rtpCapabilities: RtpCapabilities;
    producerUsername: string;
    incomingProducerId?: string;
    table_id: string;
    username: string;
  }) {
    let newConsumer: {
      consumer: Consumer;
      producerId: string;
      id: string;
      kind: string;
      rtpParameters: any;
      type: string;
      producerPaused: boolean;
    };

    // Get the consumer transport associated with the user
    const transport =
      roomConsumerTransports[event.table_id][event.username].transport;
    const producer =
      event.consumerType === "camera" || event.consumerType === "screen"
        ? event.incomingProducerId
          ? roomProducers[event.table_id][event.producerUsername][
              event.consumerType as "camera" | "screen"
            ]?.[event.incomingProducerId]
          : undefined
        : roomProducers[event.table_id][event.producerUsername][
            event.consumerType as "audio"
          ];

    if (!producer) {
      console.error(`No producer found`);
      return;
    }

    try {
      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: event.rtpCapabilities,
        paused: producer.kind === "video",
      });

      newConsumer = {
        consumer: consumer,
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (error) {
      console.error("consume failed: ", error);
      return;
    }

    if (!roomConsumers[event.table_id]) {
      roomConsumers[event.table_id] = {};
    }
    if (!roomConsumers[event.table_id][event.username]) {
      roomConsumers[event.table_id][event.username] = {};
    }
    if (
      !roomConsumers[event.table_id][event.username][event.producerUsername]
    ) {
      roomConsumers[event.table_id][event.username][event.producerUsername] =
        {};
    }
    if (
      (event.consumerType === "camera" || event.consumerType === "screen") &&
      !roomConsumers[event.table_id][event.username][event.producerUsername][
        event.consumerType as "camera" | "screen"
      ]
    ) {
      roomConsumers[event.table_id][event.username][event.producerUsername][
        event.consumerType as "camera" | "screen"
      ] = {};
    }

    if (
      (event.consumerType === "camera" || event.consumerType === "screen") &&
      event.incomingProducerId
    ) {
      roomConsumers[event.table_id][event.username][event.producerUsername][
        event.consumerType as "camera" | "screen"
      ]![event.incomingProducerId] = newConsumer;
    } else {
      roomConsumers[event.table_id][event.username][event.producerUsername][
        event.consumerType as "audio"
      ] = newConsumer;
    }

    this.io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "newConsumerSubscribed",
      producerUsername: event.producerUsername,
      consumerId: event.incomingProducerId,
      consumerType: event.consumerType,
      data: {
        producerId: newConsumer.producerId,
        id: newConsumer.id,
        kind: newConsumer.kind,
        rtpParameters: newConsumer.rtpParameters,
        type: newConsumer.type,
        producerPaused: newConsumer.producerPaused,
      },
    });
  }

  onNewConsumerCreated(event: {
    type: string;
    username: string;
    table_id: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
  }) {
    const msg = {
      type: "newConsumerWasCreated",
      producerUsername: event.producerUsername,
      consumerId: event.consumerId,
      consumerType: event.consumerType,
    };
    this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
  }

  onUnsubscribe(event: { type: string; table_id: string; username: string }) {
    if (
      roomConsumerTransports[event.table_id] &&
      roomConsumerTransports[event.table_id][event.username]
    ) {
      delete roomConsumerTransports[event.table_id][event.username];
    }

    if (
      (!roomProducerTransports ||
        (roomProducerTransports[event.table_id] &&
          Object.keys(roomProducerTransports[event.table_id]).length === 0)) &&
      (!roomConsumerTransports ||
        (roomConsumerTransports[event.table_id] &&
          Object.keys(roomConsumerTransports[event.table_id]).length === 0))
    ) {
      releaseWorker(workersMap[event.table_id]);
      delete workersMap[event.table_id];
    }

    if (
      roomConsumers[event.table_id] &&
      roomConsumers[event.table_id][event.username]
    ) {
      delete roomConsumers[event.table_id][event.username];
    }

    const msg = {
      type: "unsubscribed",
    };
    this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
  }
}

export default Consumers;
