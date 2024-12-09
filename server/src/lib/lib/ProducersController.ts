import { Server as SocketIOServer } from "socket.io";
import {
  tableProducerTransports,
  tableProducers,
  workersMap,
} from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import { getNextWorker, getWorkerByIdx } from "../workerManager";
import MediasoupCleanup from "./MediasoupCleanup";
import {
  onConnectProducerTransportType,
  onCreateNewJSONProducerType,
  onCreateNewProducerType,
  onCreateProducerTransportType,
  onNewProducerCreatedType,
  onRemoveProducerType,
} from "../mediasoupTypes";

class ProducersController {
  private mediasoupCleanup: MediasoupCleanup;

  constructor(private io: SocketIOServer) {
    this.mediasoupCleanup = new MediasoupCleanup();
  }

  onCreateProducerTransport = async (event: onCreateProducerTransportType) => {
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

      tableProducerTransports[event.table_id][event.username][event.instance] =
        {
          transport,
          isConnected: false,
        };

      this.io
        .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
        .emit("message", {
          type: "producerTransportCreated",
          params: params,
        });
    }
  };

  onConnectProducerTransport = async (
    event: onConnectProducerTransportType
  ) => {
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
  };

  onCreateNewProducer = async (event: onCreateNewProducerType) => {
    const { kind, rtpParameters } = event;

    if (
      !tableProducerTransports[event.table_id] ||
      !tableProducerTransports[event.table_id][event.username] ||
      !tableProducerTransports[event.table_id][event.username][event.instance]
    ) {
      return;
    }

    if (
      ((event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio") &&
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
      (event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio") &&
      !tableProducers[event.table_id][event.username][event.instance][
        event.producerType
      ]
    ) {
      tableProducers[event.table_id][event.username][event.instance][
        event.producerType
      ] = {};
    }

    if (
      event.producerType === "camera" ||
      event.producerType === "screen" ||
      event.producerType === "screenAudio"
    ) {
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

  onCreateNewJSONProducer = async (event: onCreateNewJSONProducerType) => {
    const {
      label,
      protocol,
      producerId,
      table_id,
      username,
      instance,
      sctpStreamParameters,
      dataStreamType,
    } = event;

    // Validate that the transport and producer type are correctly set up
    if (
      !tableProducerTransports[table_id] ||
      !tableProducerTransports[table_id][username] ||
      !tableProducerTransports[table_id][username][instance]
    ) {
      console.error(
        "Producer transport not found for the given table, username, or instance."
      );
      return;
    }

    // Check if a producer of this type already exists, and avoid creating a new one if it does
    if (
      tableProducers[table_id]?.[username]?.[instance]?.json?.[dataStreamType]
    ) {
      return;
    }

    // Now, produce the new JSON producer
    try {
      const transport =
        tableProducerTransports[table_id][username][instance].transport;
      const newProducer = await transport.produceData({
        label,
        protocol,
        // @ts-expect-error: I don't know but it works
        sctpStreamParameters,
      });

      // Make sure the producers object structure exists for the new producer
      if (!tableProducers[table_id]) {
        tableProducers[table_id] = {};
      }
      if (!tableProducers[table_id][username]) {
        tableProducers[table_id][username] = {};
      }
      if (!tableProducers[table_id][username][instance]) {
        tableProducers[table_id][username][instance] = {};
      }
      if (!tableProducers[table_id][username][instance].json) {
        tableProducers[table_id][username][instance].json = {};
      }

      // Store the new JSON producer under the appropriate keys
      if (producerId) {
        tableProducers[table_id][username][instance].json[dataStreamType] =
          newProducer;
      }

      // Emit a message indicating the new JSON producer is available
      const msg = {
        type: "newJSONProducerAvailable",
        producerUsername: username,
        producerInstance: instance,
        producerType: "json",
        producerId,
        dataStreamType,
      };

      this.io.to(`table_${table_id}`).emit("message", msg);
      this.io
        .to(`instance_${table_id}_${username}_${instance}`)
        .emit("newJSONProducerCallback", {
          id: newProducer.id, // Return the producer's ID after successful creation
        });
    } catch (error) {
      console.error("Error creating JSON producer:", error);
    }
  };

  onNewProducerCreated = (event: onNewProducerCreatedType) => {
    const msg = {
      type: "newProducerWasCreated",
      producerType: event.producerType,
      producerId: event.producerId,
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  };

  onRemoveProducer = (event: onRemoveProducerType) => {
    try {
      this.mediasoupCleanup.removeProducer(
        event.table_id,
        event.username,
        event.instance,
        event.producerType,
        event.producerId,
        event.dataStreamType
      );

      // Remove consumers
      this.mediasoupCleanup.removeConsumer(
        event.table_id,
        event.username,
        event.instance,
        event.producerType,
        event.producerId,
        event.dataStreamType
      );

      this.mediasoupCleanup.releaseWorkers(event.table_id);

      const msg = {
        type: "producerDisconnected",
        producerUsername: event.username,
        producerInstance: event.instance,
        producerType: event.producerType,
        producerId: event.producerId,
        dataStreamType: event.dataStreamType,
      };

      this.io.to(`table_${event.table_id}`).emit("message", msg);
    } catch (error) {
      console.error(error);
    }
  };
}

export default ProducersController;
