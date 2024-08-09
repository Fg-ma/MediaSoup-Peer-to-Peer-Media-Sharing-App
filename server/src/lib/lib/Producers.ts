import { Server as SocketIOServer, Socket } from "socket.io";
import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
} from "mediasoup/node/lib/types";
import {
  roomProducerTransports,
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
  workersMap,
} from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import { getNextWorker, getWorkerByIdx, releaseWorker } from "../workerManager";

class Producers {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async onCreateProducerTransport(event: {
    type: string;
    forceTcp: boolean;
    rtpCapabilities: RtpCapabilities;
    producerType: string;
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

      if (
        !roomProducerTransports[event.table_id] ||
        !roomProducerTransports[event.table_id][event.username]
      ) {
        const { transport, params } = await createWebRtcTransport(
          mediasoupRouter
        );
        if (!roomProducerTransports[event.table_id]) {
          roomProducerTransports[event.table_id] = {};
        }

        roomProducerTransports[event.table_id][event.username] = {
          transport,
          isConnected: false,
        };
        this.io.to(`${event.table_id}_${event.username}`).emit("message", {
          type: "producerTransportCreated",
          params: params,
        });
      } else if (
        roomProducerTransports[event.table_id] &&
        roomProducerTransports[event.table_id][event.username]
      ) {
        const msg = {
          type: "newProducer",
          producerType: event.producerType,
        };
        this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
      }
    } catch (error) {
      console.error(error);
      this.io.to(`${event.table_id}_${event.username}`).emit("message", {
        type: "producerTransportCreated",
        error,
      });
    }
  }

  async onDeleteProducerTransport(event: {
    type: string;
    table_id: string;
    username: string;
  }) {
    try {
      if (
        roomProducerTransports[event.table_id] &&
        roomProducerTransports[event.table_id][event.username]
      ) {
        delete roomProducerTransports[event.table_id][event.username];
      }
      if (Object.keys(roomProducerTransports[event.table_id]).length === 0) {
        delete roomProducerTransports[event.table_id];
      }
      if (
        (!roomProducerTransports ||
          (roomProducerTransports[event.table_id] &&
            Object.keys(roomProducerTransports[event.table_id]).length ===
              0)) &&
        (!roomConsumerTransports ||
          (roomConsumerTransports[event.table_id] &&
            Object.keys(roomConsumerTransports[event.table_id]).length === 0))
      ) {
        releaseWorker(workersMap[event.table_id]);
        delete workersMap[event.table_id];
      }
    } catch (error) {
      console.error(error);
    }
  }

  async onConnectProducerTransport(event: {
    type: string;
    dtlsParameters: DtlsParameters;
    table_id: "string";
    username: "string";
  }) {
    if (
      !roomProducerTransports[event.table_id] ||
      !roomProducerTransports[event.table_id][event.username]
    ) {
      console.error("No producer transport found for: ", event.username);
      return;
    }

    if (!roomProducerTransports[event.table_id][event.username].isConnected) {
      await roomProducerTransports[event.table_id][
        event.username
      ].transport.connect({
        dtlsParameters: event.dtlsParameters,
      });
      roomProducerTransports[event.table_id][event.username].isConnected = true;
    }

    this.io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "producerConnected",
      data: "producer connected",
    });
  }

  onCreateNewProducer = async (event: {
    producerType: string;
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    table_id: string;
    username: string;
    producerId?: string;
  }) => {
    const { kind, rtpParameters } = event;

    if (
      !roomProducerTransports[event.table_id] ||
      !roomProducerTransports[event.table_id][event.username]
    ) {
      console.error("No producer transport found for: ", event.username);
      return;
    }

    if (
      ((event.producerType === "camera" || event.producerType === "screen") &&
        event.producerId &&
        roomProducers[event.table_id]?.[event.username]?.[
          event.producerType as "camera" | "screen"
        ]?.[event.producerId]) ||
      (event.producerType === "audio" &&
        roomProducers[event.table_id]?.[event.username]?.[
          event.producerType as "audio"
        ])
    ) {
      console.error("Producer already created for: ", event.username);
      return;
    }

    const newProducer = await roomProducerTransports[event.table_id][
      event.username
    ].transport.produce({
      kind,
      rtpParameters,
    });

    if (!roomProducers[event.table_id]) {
      roomProducers[event.table_id] = {};
    }
    if (!roomProducers[event.table_id][event.username]) {
      roomProducers[event.table_id][event.username] = {};
    }
    if (
      (event.producerType === "camera" || event.producerType === "screen") &&
      !roomProducers[event.table_id][event.username][
        event.producerType as "camera" | "screen"
      ]
    ) {
      roomProducers[event.table_id][event.username][
        event.producerType as "camera" | "screen"
      ] = {};
    }

    if (
      (event.producerType === "camera" || event.producerType === "screen") &&
      event.producerId &&
      roomProducers[event.table_id][event.username][
        event.producerType as "camera" | "screen"
      ]
    ) {
      roomProducers[event.table_id][event.username][
        event.producerType as "camera" | "screen"
      ]![event.producerId] = newProducer;
    } else {
      roomProducers[event.table_id][event.username][
        event.producerType as "audio"
      ] = newProducer;
    }

    const msg = {
      type: "newProducerAvailable",
      producerUsername: event.username,
      producerType: event.producerType,
      producerId: event.producerId,
    };
    this.io.to(event.table_id).emit("message", msg);
    this.io
      .to(`${event.table_id}_${event.username}`)
      .emit("newProducerCallback", {
        id: newProducer.id,
      });
  };

  onNewProducerCreated(event: {
    type: string;
    username: string;
    table_id: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
  }) {
    const msg = {
      type: "newProducerWasCreated",
      producerType: event.producerType,
      producerId: event.producerId,
    };
    this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
  }

  async onRemoveProducer(event: {
    type: string;
    table_id: string;
    username: string;
    producerType: "camera" | "screen" | "audio";
    producerId?: string;
  }) {
    try {
      // Remove producers
      if (
        event.producerId &&
        (event.producerType === "camera" || event.producerType === "screen") &&
        roomProducers[event.table_id]?.[event.username]?.[event.producerType]?.[
          event.producerId
        ]
      ) {
        if (
          Object.keys(
            roomProducers[event.table_id][event.username][
              event.producerType as "camera" | "screen"
            ] || {}
          ).length === 1
        ) {
          if (
            Object.keys(roomProducers[event.table_id][event.username] || {})
              .length === 1
          ) {
            if (Object.keys(roomProducers[event.table_id] || {}).length === 1) {
              delete roomProducers[event.table_id];
            } else {
              delete roomProducers[event.table_id][event.username];
            }
          } else {
            delete roomProducers[event.table_id][event.username][
              event.producerType as "camera" | "screen"
            ];
          }
        } else {
          delete roomProducers[event.table_id][event.username][
            event.producerType as "camera" | "screen"
          ]![event.producerId];
        }
      } else if (
        event.producerType === "audio" &&
        roomProducers[event.table_id]?.[event.username]?.[event.producerType]
      ) {
        if (
          Object.keys(roomProducers[event.table_id][event.username] || {})
            .length === 1
        ) {
          if (Object.keys(roomProducers[event.table_id] || {}).length === 1) {
            delete roomProducers[event.table_id];
          } else {
            delete roomProducers[event.table_id][event.username];
          }
        } else {
          delete roomProducers[event.table_id][event.username][
            event.producerType as "audio"
          ];
        }
      }

      // Remove consumers
      for (const username in roomConsumers[event.table_id]) {
        for (const producerUsername in roomConsumers[event.table_id][
          username
        ]) {
          if (producerUsername === event.username) {
            for (const producerType in roomConsumers[event.table_id][username][
              producerUsername
            ]) {
              if (
                producerType === event.producerType &&
                (producerType === "camera" || producerType === "screen")
              ) {
                for (const producerId in roomConsumers[event.table_id][
                  username
                ][producerUsername][producerType as "camera" | "screen"]) {
                  if (producerId === event.producerId) {
                    delete roomConsumers[event.table_id][username][
                      producerUsername
                    ][producerType as "camera" | "screen"]![producerId];
                  }
                  if (
                    Object.keys(
                      roomConsumers[event.table_id][username][producerUsername][
                        producerType as "camera" | "screen"
                      ] || {}
                    ).length === 0
                  ) {
                    delete roomConsumers[event.table_id][username][
                      producerUsername
                    ][producerType as "camera" | "screen" | "audio"];
                  }
                }
              }
              if (
                producerType === event.producerType &&
                producerType === "audio"
              ) {
                delete roomConsumers[event.table_id][username][
                  producerUsername
                ][producerType as "audio"];
              }
              if (
                Object.keys(
                  roomConsumers[event.table_id][username][producerUsername]
                ).length === 0
              ) {
                delete roomConsumers[event.table_id][username][
                  producerUsername
                ];
              }
            }
          }
          if (
            Object.keys(roomConsumers[event.table_id][username]).length === 0
          ) {
            delete roomConsumers[event.table_id][username];
          }
        }
        if (Object.keys(roomConsumers[event.table_id]).length === 0) {
          delete roomConsumers[event.table_id];
        }
      }

      // Remove producer transports
      if (
        (roomProducerTransports[event.table_id] &&
          roomProducerTransports[event.table_id][event.username] &&
          roomProducers[event.table_id] &&
          roomProducers[event.table_id][event.username] &&
          Object.keys(roomProducers[event.table_id][event.username]).length ===
            0) ||
        !roomProducers[event.table_id] ||
        !roomProducers[event.table_id][event.username]
      ) {
        delete roomProducerTransports[event.table_id][event.username];
      }
      if (
        roomProducerTransports[event.table_id] &&
        Object.keys(roomProducerTransports[event.table_id]).length == 0
      ) {
        delete roomProducerTransports[event.table_id];
      }

      // Release workers
      if (
        (!roomProducerTransports ||
          (roomProducerTransports[event.table_id] &&
            Object.keys(roomProducerTransports[event.table_id]).length ===
              0)) &&
        (!roomConsumerTransports ||
          (roomConsumerTransports[event.table_id] &&
            Object.keys(roomConsumerTransports[event.table_id]).length === 0))
      ) {
        releaseWorker(workersMap[event.table_id]);
        delete workersMap[event.table_id];
      }

      const msg = {
        type: "producerDisconnected",
        producerUsername: event.username,
        producerType: event.producerType,
        producerId: event.producerId,
      };
      this.io.to(event.table_id).emit("message", msg);
    } catch (error) {
      console.error(error);
    }
  }
}

export default Producers;
