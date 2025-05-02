import {
  DataConsumer,
  Consumer,
  RtpParameters,
  SctpStreamParameters,
} from "mediasoup/node/lib/types";
import createWebRtcTransport from "./createWebRtcTransport";
import createConsumer from "./createConsumer";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import MediasoupCleanup from "./MediasoupCleanup";
import Broadcaster from "./Broadcaster";
import {
  DataStreamTypes,
  tableConsumerTransports,
  tableConsumers,
  tableProducers,
  workersMap,
  onConnectConsumerTransportType,
  onConsumeType,
  onCreateConsumerTransportType,
  onNewConsumerCreatedType,
  onNewConsumerType,
  onNewJSONConsumerType,
  onUnsubscribeType,
} from "../typeConstant";

class ConsumersController {
  constructor(
    private broadcaster: Broadcaster,
    private mediasoupCleanup: MediasoupCleanup
  ) {}

  async onCreateConsumerTransport(event: onCreateConsumerTransportType) {
    const { tableId, username, instance } = event.header;

    // Get the next available worker and router if one doesn't already exist
    let mediasoupRouter;
    if (!workersMap[tableId]) {
      const { router, workerIdx } = getNextWorker();
      workersMap[tableId] = workerIdx;
      mediasoupRouter = router;
    } else {
      const { router } = getWorkerByIdx(workersMap[tableId]);
      mediasoupRouter = router;
    }

    const { transport, params } = await createWebRtcTransport(mediasoupRouter);

    if (!tableConsumerTransports[tableId]) {
      tableConsumerTransports[tableId] = {};
    }
    if (!tableConsumerTransports[tableId][username]) {
      tableConsumerTransports[tableId][username] = {};
    }

    tableConsumerTransports[tableId][username][instance] = {
      transport,
      isConnected: false,
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "consumerTransportCreated",
      data: {
        params: params,
      },
    });
  }

  async onConnectConsumerTransport(event: onConnectConsumerTransportType) {
    const { tableId, username, instance } = event.header;
    const { dtlsParameters } = event.data;

    if (
      !tableConsumerTransports[tableId] ||
      !tableConsumerTransports[tableId][username] ||
      !tableConsumerTransports[tableId][username][instance]
    ) {
      return;
    }

    if (!tableConsumerTransports[tableId][username][instance].isConnected) {
      await tableConsumerTransports[tableId][username][
        instance
      ].transport.connect({
        dtlsParameters: dtlsParameters,
      });
      tableConsumerTransports[tableId][username][instance].isConnected = true;
    }

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "consumerTransportConnected",
      data: "consumer transport connected",
    });
  }

  async onConsume(event: onConsumeType) {
    const { tableId, username, instance } = event.header;
    const { rtpCapabilities } = event.data;

    // Get the next available worker and router
    const { router: mediasoupRouter } = getWorkerByIdx(workersMap[tableId]);

    const consumers = await createConsumer(
      tableId,
      username,
      instance,
      tableProducers[tableId],
      rtpCapabilities,
      mediasoupRouter
    );

    if (!tableConsumers[tableId]) {
      tableConsumers[tableId] = {};
    }
    if (!tableConsumers[tableId][username]) {
      tableConsumers[tableId][username] = {};
    }
    if (!tableConsumers[tableId][username][instance]) {
      tableConsumers[tableId][username][instance] = {};
    }
    if (!tableConsumers[tableId][username][instance]) {
      tableConsumers[tableId][username][instance] = {};
    }
    if (consumers) {
      tableConsumers[tableId][username][instance] = consumers;
    } else {
      this.mediasoupCleanup.clearTableConsumers(tableId, username, instance);
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
                sctpStreamParameters: json.sctpStreamParameters!,
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

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "subscribed",
      data: newConsumers,
    });
  }

  async onNewConsumer(event: onNewConsumerType) {
    const { tableId, username, instance } = event.header;
    const {
      producerType,
      producerId,
      producerUsername,
      producerInstance,
      rtpCapabilities,
    } = event.data;

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
      tableConsumerTransports[tableId][username][instance].transport;

    const producer =
      producerType === "camera" ||
      producerType === "screen" ||
      producerType === "screenAudio"
        ? producerId
          ? tableProducers[tableId][producerUsername][producerInstance]?.[
              producerType
            ]?.[producerId]
          : undefined
        : tableProducers[tableId][producerUsername][producerInstance][
            producerType
          ];

    if (!producer) {
      console.error(`No producer found`);
      return;
    }

    try {
      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: rtpCapabilities,
        paused:
          producerType === "camera" ||
          producerType === "screen" ||
          producerType === "screenAudio",
      });

      newConsumer = {
        consumer: consumer,
        producerId: consumer.producerId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      };
    } catch (_error) {
      return;
    }

    if (!tableConsumers[tableId]) {
      tableConsumers[tableId] = {};
    }
    if (!tableConsumers[tableId][username]) {
      tableConsumers[tableId][username] = {};
    }
    if (!tableConsumers[tableId][username][instance]) {
      tableConsumers[tableId][username][instance] = {};
    }
    if (!tableConsumers[tableId][username][instance][producerUsername]) {
      tableConsumers[tableId][username][instance][producerUsername] = {};
    }
    if (
      !tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ]
    ) {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ] = {};
    }
    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
      !tableConsumers[tableId][username][instance][producerUsername][
        producerType
      ]
    ) {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ][producerType] = {};
    }

    if (
      producerType === "camera" ||
      producerType === "screen" ||
      producerType === "screenAudio"
    ) {
      if (producerId) {
        tableConsumers[tableId][username][instance][producerUsername][
          producerInstance
        ][producerType]![producerId] = newConsumer;
      }
    } else {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ][producerType] = newConsumer;
    }

    const msg = {
      type: "newConsumerSubscribed",
      header: {
        producerUsername,
        producerInstance,
        producerId,
        producerType,
      },
      data: {
        id: newConsumer.id,
        producerId: newConsumer.producerId,
        kind: newConsumer.kind,
        rtpParameters: newConsumer.rtpParameters,
        type: newConsumer.type,
        producerPaused: newConsumer.producerPaused,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  }

  async onNewJSONConsumer(event: onNewJSONConsumerType) {
    const { tableId, username, instance } = event.header;
    const {
      producerUsername,
      producerInstance,
      producerType,
      incomingProducerId,
      dataStreamType,
    } = event.data;

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
      tableConsumerTransports[tableId][username][instance].transport;

    const producer =
      tableProducers[tableId][producerUsername][producerInstance]?.[
        producerType
      ]?.[dataStreamType];
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
        sctpStreamParameters: consumer.sctpStreamParameters,
        type: consumer.type,
        producerPaused: consumer.dataProducerPaused,
        protocol: consumer.protocol,
      };
    } catch (_error) {
      return;
    }

    if (!tableConsumers[tableId]) {
      tableConsumers[tableId] = {};
    }
    if (!tableConsumers[tableId][username]) {
      tableConsumers[tableId][username] = {};
    }
    if (!tableConsumers[tableId][username][instance]) {
      tableConsumers[tableId][username][instance] = {};
    }
    if (!tableConsumers[tableId][username][instance][producerUsername]) {
      tableConsumers[tableId][username][instance][producerUsername] = {};
    }
    if (
      !tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ]
    ) {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ] = {};
    }
    if (
      !tableConsumers[tableId][username][instance][producerUsername][
        producerType
      ]
    ) {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ][producerType] = {};
    }

    if (incomingProducerId) {
      tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ][producerType]![dataStreamType] = newConsumer;
    }

    const msg = {
      type: "newJSONConsumerSubscribed",
      header: {
        producerUsername,
        producerInstance,
        producerId: incomingProducerId,
        producerType,
        dataStreamType,
      },
      data: {
        id: newConsumer.id,
        producerId: newConsumer.producerId,
        label: newConsumer.label,
        sctpStreamParameters: newConsumer.sctpStreamParameters,
        type: newConsumer.type,
        producerPaused: newConsumer.producerPaused,
        protocol: newConsumer.protocol,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  }

  onNewConsumerCreated(event: onNewConsumerCreatedType) {
    const { tableId, username, instance } = event.header;
    const { producerUsername, producerInstance, producerType, producerId } =
      event.data;

    const msg = {
      type: "newConsumerWasCreated",
      header: {
        producerUsername,
        producerInstance,
        producerType,
        producerId,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  }

  onUnsubscribe(event: onUnsubscribeType) {
    const { tableId, username, instance } = event.header;

    this.mediasoupCleanup.deleteConsumerTransport(tableId, username, instance);

    this.mediasoupCleanup.releaseWorkers(tableId);

    if (
      tableConsumers[tableId] &&
      tableConsumers[tableId][username] &&
      tableConsumers[tableId][username][instance]
    ) {
      delete tableConsumers[tableId][username][instance];

      this.mediasoupCleanup.clearTableConsumers(tableId, username, instance);
    }

    const msg = {
      type: "unsubscribed",
    };
    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  }
}

export default ConsumersController;
