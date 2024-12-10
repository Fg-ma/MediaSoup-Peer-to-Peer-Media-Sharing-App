import { Server as SocketIOServer } from "socket.io";
import { DataConsumer } from "mediasoup/node/lib/types";
import { Consumer } from "mediasoup/node/lib/types";
import {
  DataStreamTypes,
  tableConsumerTransports,
  tableConsumers,
  tableProducers,
  workersMap,
} from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import createConsumer from "../createConsumer";
import { getNextWorker, getWorkerByIdx } from "../workerManager";
import MediasoupCleanup from "./MediasoupCleanup";
import { SctpStreamParameters } from "mediasoup/node/lib/fbs/sctp-parameters";
import { RtpParameters } from "mediasoup/node/lib/fbs/rtp-parameters";
import {
  onConnectConsumerTransportType,
  onConsumeType,
  onCreateConsumerTransportType,
  onNewConsumerCreatedType,
  onNewConsumerType,
  onNewJSONConsumerType,
  onUnsubscribeType,
} from "../mediasoupTypes";

class ConsumersController {
  private mediasoupCleanup: MediasoupCleanup;

  constructor(private io: SocketIOServer) {
    this.mediasoupCleanup = new MediasoupCleanup();
  }

  async onCreateConsumerTransport(event: onCreateConsumerTransportType) {
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

      if (!tableConsumerTransports[event.table_id]) {
        tableConsumerTransports[event.table_id] = {};
      }
      if (!tableConsumerTransports[event.table_id][event.username]) {
        tableConsumerTransports[event.table_id][event.username] = {};
      }

      tableConsumerTransports[event.table_id][event.username][event.instance] =
        {
          transport,
          isConnected: false,
        };

      this.io
        .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
        .emit("message", {
          type: "consumerTransportCreated",
          params: params,
        });
    } catch (error) {
      this.io
        .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
        .emit("error", error);
    }
  }

  async onConnectConsumerTransport(event: onConnectConsumerTransportType) {
    if (
      !tableConsumerTransports[event.table_id] ||
      !tableConsumerTransports[event.table_id][event.username] ||
      !tableConsumerTransports[event.table_id][event.username][event.instance]
    ) {
      return;
    }

    if (
      !tableConsumerTransports[event.table_id][event.username][event.instance]
        .isConnected
    ) {
      await tableConsumerTransports[event.table_id][event.username][
        event.instance
      ].transport.connect({
        dtlsParameters: event.dtlsParameters,
      });
      tableConsumerTransports[event.table_id][event.username][
        event.instance
      ].isConnected = true;
    }

    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", {
        type: "consumerTransportConnected",
        data: "consumer transport connected",
      });
  }

  async onConsume(event: onConsumeType) {
    // Get the next available worker and router
    const { router: mediasoupRouter } = getWorkerByIdx(
      workersMap[event.table_id]
    );

    const consumers = await createConsumer(
      event.table_id,
      event.username,
      event.instance,
      tableProducers[event.table_id],
      event.rtpCapabilities,
      mediasoupRouter
    );

    if (!tableConsumers[event.table_id]) {
      tableConsumers[event.table_id] = {};
    }
    if (!tableConsumers[event.table_id][event.username]) {
      tableConsumers[event.table_id][event.username] = {};
    }
    if (!tableConsumers[event.table_id][event.username][event.instance]) {
      tableConsumers[event.table_id][event.username][event.instance] = {};
    }
    if (!tableConsumers[event.table_id][event.username][event.instance]) {
      tableConsumers[event.table_id][event.username][event.instance] = {};
    }
    if (consumers) {
      tableConsumers[event.table_id][event.username][event.instance] =
        consumers;
    } else {
      this.mediasoupCleanup.clearTableConsumers(
        event.table_id,
        event.username,
        event.instance
      );
    }

    const newConsumers: {
      [producerUsername: string]: {
        [producerInstance: string]: {
          camera?: {
            [cameraId: string]: {
              id: string;
              producerId: string;
              kind: string;
              rtpParameters: RtpParameters;
              type: string;
              producerPaused: boolean;
            };
          };
          screen?: {
            [screenId: string]: {
              id: string;
              producerId: string;
              kind: string;
              rtpParameters: RtpParameters;
              type: string;
              producerPaused: boolean;
            };
          };
          screenAudio?: {
            [screenAudioId: string]: {
              id: string;
              producerId: string;
              kind: string;
              rtpParameters: RtpParameters;
              type: string;
              producerPaused: boolean;
            };
          };
          audio?: {
            id: string;
            producerId: string;
            kind: string;
            rtpParameters: RtpParameters;
            type: string;
            producerPaused: boolean;
          };
          json?: {
            [jsonId: string]: {
              id: string;
              producerId: string;
              label: string;
              sctpStreamParameters: SctpStreamParameters;
              type: string;
              producerPaused: boolean;
              protocol: string;
            };
          };
        };
      };
    } = {};

    for (const producerUsername in consumers) {
      for (const producerInstance in consumers[producerUsername]) {
        if (
          consumers[producerUsername] &&
          consumers[producerUsername][producerInstance] &&
          consumers[producerUsername][producerInstance].camera
        ) {
          if (!newConsumers[producerUsername]) {
            newConsumers[producerUsername] = {};
          }
          if (!newConsumers[producerUsername][producerInstance]) {
            newConsumers[producerUsername][producerInstance] = {};
          }
          if (!newConsumers[producerUsername][producerInstance].camera) {
            newConsumers[producerUsername][producerInstance].camera = {};
          }
          for (const cameraId in consumers[producerUsername][producerInstance]
            .camera) {
            const camera =
              consumers[producerUsername][producerInstance].camera?.[cameraId];

            if (camera) {
              newConsumers[producerUsername][producerInstance].camera![
                cameraId
              ] = {
                id: camera.id,
                producerId: camera.producerId,
                kind: camera.kind,
                rtpParameters: camera.rtpParameters,
                type: camera.type,
                producerPaused: camera.producerPaused,
              };
            }
          }
        }

        if (
          consumers[producerUsername] &&
          consumers[producerUsername][producerInstance] &&
          consumers[producerUsername][producerInstance].screen
        ) {
          if (!newConsumers[producerUsername]) {
            newConsumers[producerUsername] = {};
          }
          if (!newConsumers[producerUsername][producerInstance]) {
            newConsumers[producerUsername][producerInstance] = {};
          }
          if (!newConsumers[producerUsername][producerInstance].screen) {
            newConsumers[producerUsername][producerInstance].screen = {};
          }
          for (const screenId in consumers[producerUsername][producerInstance]
            .screen) {
            const screen =
              consumers[producerUsername][producerInstance].screen?.[screenId];

            if (screen)
              newConsumers[producerUsername][producerInstance].screen![
                screenId
              ] = {
                id: screen.id,
                producerId: screen.producerId,
                kind: screen.kind,
                rtpParameters: screen.rtpParameters,
                type: screen.type,
                producerPaused: screen.producerPaused,
              };
          }
        }

        if (
          consumers[producerUsername] &&
          consumers[producerUsername][producerInstance] &&
          consumers[producerUsername][producerInstance].screenAudio
        ) {
          if (!newConsumers[producerUsername]) {
            newConsumers[producerUsername] = {};
          }
          if (!newConsumers[producerUsername][producerInstance]) {
            newConsumers[producerUsername][producerInstance] = {};
          }
          if (!newConsumers[producerUsername][producerInstance].screenAudio) {
            newConsumers[producerUsername][producerInstance].screenAudio = {};
          }
          for (const screenAudioId in consumers[producerUsername][
            producerInstance
          ].screenAudio) {
            const screenAudio =
              consumers[producerUsername][producerInstance].screenAudio?.[
                screenAudioId
              ];

            if (screenAudio)
              newConsumers[producerUsername][producerInstance].screenAudio![
                screenAudioId
              ] = {
                id: screenAudio.id,
                producerId: screenAudio.producerId,
                kind: screenAudio.kind,
                rtpParameters: screenAudio.rtpParameters,
                type: screenAudio.type,
                producerPaused: screenAudio.producerPaused,
              };
          }
        }

        if (
          consumers[producerUsername] &&
          consumers[producerUsername][producerInstance] &&
          consumers[producerUsername][producerInstance].audio
        ) {
          if (!newConsumers[producerUsername]) {
            newConsumers[producerUsername] = {};
          }
          if (!newConsumers[producerUsername][producerInstance]) {
            newConsumers[producerUsername][producerInstance] = {};
          }

          const audioConsumerData =
            consumers[producerUsername][producerInstance].audio;

          newConsumers[producerUsername][producerInstance].audio = {
            id: audioConsumerData.id,
            producerId: audioConsumerData.producerId,
            kind: audioConsumerData.kind,
            rtpParameters: audioConsumerData.rtpParameters,
            type: audioConsumerData.type,
            producerPaused: audioConsumerData.producerPaused,
          };
        }

        if (
          consumers[producerUsername] &&
          consumers[producerUsername][producerInstance] &&
          consumers[producerUsername][producerInstance].json
        ) {
          if (!newConsumers[producerUsername]) {
            newConsumers[producerUsername] = {};
          }
          if (!newConsumers[producerUsername][producerInstance]) {
            newConsumers[producerUsername][producerInstance] = {};
          }
          if (!newConsumers[producerUsername][producerInstance].json) {
            newConsumers[producerUsername][producerInstance].json = {};
          }
          for (const dataStreamType in consumers[producerUsername][
            producerInstance
          ].json) {
            const json =
              consumers[producerUsername][producerInstance].json?.[
                dataStreamType as DataStreamTypes
              ];

            if (json) {
              newConsumers[producerUsername][producerInstance].json![
                dataStreamType as DataStreamTypes
              ] = {
                id: json.id,
                producerId: json.producerId,
                // @ts-expect-error: IDK
                sctpStreamParameters: json.sctpStreamParameters,
                label: json.label,
                type: json.type,
                producerPaused: json.producerPaused,
                protocol: json.protocol,
              };
            }
          }
        }
      }
    }

    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", {
        type: "subscribed",
        data: newConsumers,
      });
  }

  async onNewConsumer(event: onNewConsumerType) {
    let newConsumer: {
      consumer: Consumer;
      producerId: string;
      id: string;
      kind: string;
      rtpParameters: RtpParameters;
      type: string;
      producerPaused: boolean;
    };

    // Get the consumer transport associated with the user
    const transport =
      tableConsumerTransports[event.table_id][event.username][event.instance]
        .transport;

    const producer =
      event.producerType === "camera" ||
      event.producerType === "screen" ||
      event.producerType === "screenAudio"
        ? event.producerId
          ? tableProducers[event.table_id][event.producerUsername][
              event.producerInstance
            ]?.[event.producerType]?.[event.producerId]
          : undefined
        : tableProducers[event.table_id][event.producerUsername][
            event.producerInstance
          ][event.producerType];

    if (!producer) {
      console.error(`No producer found`);
      return;
    }

    try {
      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: event.rtpCapabilities,
        paused:
          event.producerType === "camera" ||
          event.producerType === "screen" ||
          event.producerType === "screenAudio",
      });

      newConsumer = {
        consumer: consumer,
        producerId: consumer.producerId,
        id: consumer.id,
        kind: consumer.kind,
        // @ts-expect-error: type shit
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (_error) {
      return;
    }

    if (!tableConsumers[event.table_id]) {
      tableConsumers[event.table_id] = {};
    }
    if (!tableConsumers[event.table_id][event.username]) {
      tableConsumers[event.table_id][event.username] = {};
    }
    if (!tableConsumers[event.table_id][event.username][event.instance]) {
      tableConsumers[event.table_id][event.username][event.instance] = {};
    }
    if (
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ] = {};
    }
    if (
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance] = {};
    }
    if (
      (event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio") &&
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerType]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance][event.producerType] = {};
    }

    if (
      event.producerType === "camera" ||
      event.producerType === "screen" ||
      event.producerType === "screenAudio"
    ) {
      if (event.producerId) {
        tableConsumers[event.table_id][event.username][event.instance][
          event.producerUsername
        ][event.producerInstance][event.producerType]![event.producerId] =
          newConsumer;
      }
    } else {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance][event.producerType] = newConsumer;
    }

    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", {
        type: "newConsumerSubscribed",
        producerUsername: event.producerUsername,
        producerInstance: event.producerInstance,
        producerId: event.producerId,
        producerType: event.producerType,
        data: {
          id: newConsumer.id,
          producerId: newConsumer.producerId,
          kind: newConsumer.kind,
          rtpParameters: newConsumer.rtpParameters,
          type: newConsumer.type,
          producerPaused: newConsumer.producerPaused,
        },
      });
  }

  async onNewJSONConsumer(event: onNewJSONConsumerType) {
    let newConsumer: {
      consumer: DataConsumer;
      producerId: string;
      id: string;
      label: string;
      sctpStreamParameters: SctpStreamParameters | undefined;
      type: string;
      producerPaused: boolean;
      protocol: string;
    };

    // Get the consumer transport associated with the user
    const transport =
      tableConsumerTransports[event.table_id][event.username][event.instance]
        .transport;

    const producer =
      tableProducers[event.table_id][event.producerUsername][
        event.producerInstance
      ]?.[event.producerType]?.[event.dataStreamType];
    if (!producer) {
      console.error(`No producer found`);
      return;
    }

    try {
      const consumer = await transport.consumeData({
        dataProducerId: producer.id,
      });

      newConsumer = {
        consumer: consumer,
        producerId: producer.id,
        id: consumer.id,
        label: consumer.label,
        // @ts-expect-error: hell if I know but it works
        sctpStreamParameters: consumer.sctpStreamParameters,
        type: consumer.type,
        producerPaused: consumer.dataProducerPaused,
        protocol: consumer.protocol,
      };
    } catch (_error) {
      return;
    }

    if (!tableConsumers[event.table_id]) {
      tableConsumers[event.table_id] = {};
    }
    if (!tableConsumers[event.table_id][event.username]) {
      tableConsumers[event.table_id][event.username] = {};
    }
    if (!tableConsumers[event.table_id][event.username][event.instance]) {
      tableConsumers[event.table_id][event.username][event.instance] = {};
    }
    if (
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ] = {};
    }
    if (
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance] = {};
    }
    if (
      !tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerType]
    ) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance][event.producerType] = {};
    }

    if (event.incomingProducerId) {
      tableConsumers[event.table_id][event.username][event.instance][
        event.producerUsername
      ][event.producerInstance][event.producerType]![event.dataStreamType] =
        newConsumer;
    }

    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", {
        type: "newJSONConsumerSubscribed",
        producerUsername: event.producerUsername,
        producerInstance: event.producerInstance,
        producerId: event.incomingProducerId,
        producerType: event.producerType,
        data: {
          id: newConsumer.id,
          producerId: newConsumer.producerId,
          label: newConsumer.label,
          sctpStreamParameters: newConsumer.sctpStreamParameters,
          type: newConsumer.type,
          producerPaused: newConsumer.producerPaused,
          protocol: newConsumer.protocol,
          dataStreamType: event.dataStreamType,
        },
      });
  }

  onNewConsumerCreated(event: onNewConsumerCreatedType) {
    const msg = {
      type: "newConsumerWasCreated",
      producerUsername: event.producerUsername,
      producerInstance: event.producerInstance,
      producerId: event.producerId,
      producerType: event.producerType,
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  }

  onUnsubscribe(event: onUnsubscribeType) {
    this.mediasoupCleanup.deleteConsumerTransport(
      event.table_id,
      event.username,
      event.instance
    );

    this.mediasoupCleanup.releaseWorkers(event.table_id);

    if (
      tableConsumers[event.table_id] &&
      tableConsumers[event.table_id][event.username] &&
      tableConsumers[event.table_id][event.username][event.instance]
    ) {
      delete tableConsumers[event.table_id][event.username][event.instance];

      this.mediasoupCleanup.clearTableConsumers(
        event.table_id,
        event.username,
        event.instance
      );
    }

    const msg = {
      type: "unsubscribed",
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  }
}

export default ConsumersController;
