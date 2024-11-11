import { Server as SocketIOServer } from "socket.io";
import {
  DtlsParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
} from "mediasoup/node/lib/types";
import {
  tableProducerTransports,
  tableProducers,
  workersMap,
} from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import { getNextWorker, getWorkerByIdx } from "../workerManager";
import MediasoupCleanup from "./MediasoupCleanup";

class Producers {
  private mediasoupCleanup: MediasoupCleanup;

  constructor(private io: SocketIOServer) {
    this.mediasoupCleanup = new MediasoupCleanup();
  }

  async onCreateProducerTransport(event: {
    type: string;
    forceTcp: boolean;
    rtpCapabilities: RtpCapabilities;
    producerType: string;
    table_id: string;
    username: string;
    instance: number;
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
        !tableProducerTransports[event.table_id] ||
        !tableProducerTransports[event.table_id][event.username] ||
        !tableProducerTransports[event.table_id][event.username][event.instance]
      ) {
        const { transport, params } = await createWebRtcTransport(
          mediasoupRouter
        );

        if (!tableProducerTransports[event.table_id]) {
          tableProducerTransports[event.table_id] = {};
        }
        if (!tableProducerTransports[event.table_id][event.username]) {
          tableProducerTransports[event.table_id][event.username] = {};
        }

        tableProducerTransports[event.table_id][event.username][
          event.instance
        ] = {
          transport,
          isConnected: false,
        };

        this.io
          .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
          .emit("message", {
            type: "producerTransportCreated",
            params: params,
          });
      } else if (
        tableProducerTransports[event.table_id] &&
        tableProducerTransports[event.table_id][event.username] &&
        tableProducerTransports[event.table_id][event.username][event.instance]
      ) {
        const msg = {
          type: "newProducer",
          producerType: event.producerType,
        };
        this.io
          .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
          .emit("message", msg);
      }
    } catch (error) {
      console.error(error);
      this.io
        .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
        .emit("message", {
          type: "producerTransportCreated",
          error,
        });
    }
  }

  async onDeleteProducerTransport(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
  }) {
    this.mediasoupCleanup.deleteProducerTransports(
      event.table_id,
      event.username,
      event.instance
    );

    this.mediasoupCleanup.releaseWorkers(event.table_id);
  }

  async onConnectProducerTransport(event: {
    type: string;
    dtlsParameters: DtlsParameters;
    table_id: string;
    username: string;
    instance: string;
  }) {
    if (
      !tableProducerTransports[event.table_id] ||
      !tableProducerTransports[event.table_id][event.username] ||
      !tableProducerTransports[event.table_id][event.username][event.instance]
    ) {
      return;
    }

    if (
      !tableProducerTransports[event.table_id][event.username][event.instance]
        .isConnected
    ) {
      await tableProducerTransports[event.table_id][event.username][
        event.instance
      ].transport.connect({
        dtlsParameters: event.dtlsParameters,
      });
      tableProducerTransports[event.table_id][event.username][
        event.instance
      ].isConnected = true;
    }

    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", {
        type: "producerConnected",
        data: "producer connected",
      });
  }

  onCreateNewProducer = async (event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
    transportId: string;
    kind: MediaKind;
    rtpParameters: RtpParameters;
    table_id: string;
    username: string;
    instance: string;
    producerId?: string;
  }) => {
    const { kind, rtpParameters } = event;

    if (
      !tableProducerTransports[event.table_id] ||
      !tableProducerTransports[event.table_id][event.username] ||
      !tableProducerTransports[event.table_id][event.username][event.instance]
    ) {
      return;
    }

    if (
      ((event.producerType === "camera" || event.producerType === "screen") &&
        event.producerId &&
        tableProducers[event.table_id]?.[event.username]?.[event.instance]?.[
          event.producerType
        ]?.[event.producerId]) ||
      (event.producerType === "audio" &&
        tableProducers[event.table_id]?.[event.username]?.[event.instance]?.[
          event.producerType
        ])
    ) {
      return;
    }

    const newProducer = await tableProducerTransports[event.table_id][
      event.username
    ][event.instance].transport.produce({
      kind,
      rtpParameters,
    });

    if (!tableProducers[event.table_id]) {
      tableProducers[event.table_id] = {};
    }
    if (!tableProducers[event.table_id][event.username]) {
      tableProducers[event.table_id][event.username] = {};
    }
    if (!tableProducers[event.table_id][event.username][event.instance]) {
      tableProducers[event.table_id][event.username][event.instance] = {};
    }
    if (
      (event.producerType === "camera" || event.producerType === "screen") &&
      !tableProducers[event.table_id][event.username][event.instance][
        event.producerType
      ]
    ) {
      tableProducers[event.table_id][event.username][event.instance][
        event.producerType
      ] = {};
    }

    if (event.producerType === "camera" || event.producerType === "screen") {
      if (event.producerId) {
        tableProducers[event.table_id][event.username][event.instance][
          event.producerType
        ]![event.producerId] = newProducer;
      }
    } else {
      tableProducers[event.table_id][event.username][event.instance][
        event.producerType
      ] = newProducer;
    }

    const msg = {
      type: "newProducerAvailable",
      producerUsername: event.username,
      producerInstance: event.instance,
      producerType: event.producerType,
      producerId: event.producerId,
    };
    this.io.to(`table_${event.table_id}`).emit("message", msg);
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("newProducerCallback", {
        id: newProducer.id,
      });
  };

  onNewProducerCreated(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
  }) {
    const msg = {
      type: "newProducerWasCreated",
      producerType: event.producerType,
      producerId: event.producerId,
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  }

  async onRemoveProducer(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId?: string;
  }) {
    try {
      this.mediasoupCleanup.removeProducer(
        event.table_id,
        event.username,
        event.instance,
        event.producerType,
        event.producerId
      );

      // Remove consumers
      this.mediasoupCleanup.removeConsumer(
        event.table_id,
        event.username,
        event.instance,
        event.producerType,
        event.producerId
      );

      // Remove producer transports
      if (
        !tableProducers[event.table_id] ||
        !tableProducers[event.table_id][event.username] ||
        !tableProducers[event.table_id][event.username][event.instance]
      ) {
        this.mediasoupCleanup.deleteProducerTransports(
          event.table_id,
          event.username,
          event.instance
        );
      }

      this.mediasoupCleanup.releaseWorkers(event.table_id);

      const msg = {
        type: "producerDisconnected",
        producerUsername: event.username,
        producerInstance: event.instance,
        producerType: event.producerType,
        producerId: event.producerId,
      };

      this.io.to(`table_${event.table_id}`).emit("message", msg);
    } catch (error) {
      console.error(error);
    }
  }
}

export default Producers;
