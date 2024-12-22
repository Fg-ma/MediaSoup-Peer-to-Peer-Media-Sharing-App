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
  onRequestRemoveProducerType,
} from "../mediasoupTypes";

class ProducersController {
  private mediasoupCleanup: MediasoupCleanup;

  constructor(private io: SocketIOServer) {
    this.mediasoupCleanup = new MediasoupCleanup();
  }

  onCreateProducerTransport = async (event: onCreateProducerTransportType) => {
    const { table_id, username, instance } = event.data;

    // Get the next available worker and router if one doesn't already exist
    let mediasoupRouter;
    if (!workersMap[table_id]) {
      const { router, workerIdx } = getNextWorker();
      workersMap[table_id] = workerIdx;
      mediasoupRouter = router;
    } else {
      const { router } = getWorkerByIdx(workersMap[table_id]);
      mediasoupRouter = router;
    }

    if (
      !tableProducerTransports[table_id] ||
      !tableProducerTransports[table_id][username] ||
      !tableProducerTransports[table_id][username][instance]
    ) {
      const { transport, params } = await createWebRtcTransport(
        mediasoupRouter
      );

      if (!tableProducerTransports[table_id]) {
        tableProducerTransports[table_id] = {};
      }
      if (!tableProducerTransports[table_id][username]) {
        tableProducerTransports[table_id][username] = {};
      }

      tableProducerTransports[table_id][username][instance] = {
        transport,
        isConnected: false,
      };

      this.io
        .to(`instance_${table_id}_${username}_${instance}`)
        .emit("message", {
          type: "producerTransportCreated",
          data: {
            params,
          },
        });
    }
  };

  onConnectProducerTransport = async (
    event: onConnectProducerTransportType
  ) => {
    const { table_id, username, instance, dtlsParameters } = event.data;

    if (
      !tableProducerTransports[table_id] ||
      !tableProducerTransports[table_id][username] ||
      !tableProducerTransports[table_id][username][instance]
    ) {
      return;
    }

    if (!tableProducerTransports[table_id][username][instance].isConnected) {
      await tableProducerTransports[table_id][username][
        instance
      ].transport.connect({
        dtlsParameters: dtlsParameters,
      });
      tableProducerTransports[table_id][username][instance].isConnected = true;
    }

    this.io.to(`instance_${table_id}_${username}_${instance}`).emit("message", {
      type: "producerConnected",
      data: "producer connected",
    });
  };

  onCreateNewProducer = async (event: onCreateNewProducerType) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      kind,
      rtpParameters,
    } = event.data;

    if (
      !tableProducerTransports[table_id] ||
      !tableProducerTransports[table_id][username] ||
      !tableProducerTransports[table_id][username][instance]
    ) {
      return;
    }

    if (
      ((producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
        producerId &&
        tableProducers[table_id]?.[username]?.[instance]?.[producerType]?.[
          producerId
        ]) ||
      (producerType === "audio" &&
        tableProducers[table_id]?.[username]?.[instance]?.[producerType])
    ) {
      return;
    }

    const newProducer = await tableProducerTransports[table_id][username][
      instance
    ].transport.produce({
      kind,
      rtpParameters,
    });

    if (!tableProducers[table_id]) {
      tableProducers[table_id] = {};
    }
    if (!tableProducers[table_id][username]) {
      tableProducers[table_id][username] = {};
    }
    if (!tableProducers[table_id][username][instance]) {
      tableProducers[table_id][username][instance] = {};
    }
    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
      !tableProducers[table_id][username][instance][producerType]
    ) {
      tableProducers[table_id][username][instance][producerType] = {};
    }

    if (
      producerType === "camera" ||
      producerType === "screen" ||
      producerType === "screenAudio"
    ) {
      if (producerId) {
        tableProducers[table_id][username][instance][producerType]![
          producerId
        ] = newProducer;
      }
    } else {
      tableProducers[table_id][username][instance][producerType] = newProducer;
    }

    const msg = {
      type: "newProducerAvailable",
      data: {
        producerUsername: username,
        producerInstance: instance,
        producerType,
        producerId,
      },
    };
    this.io.to(`table_${table_id}`).emit("message", msg);
    this.io
      .to(`instance_${table_id}_${username}_${instance}`)
      .emit("newProducerCallback", {
        id: newProducer.id,
      });
  };

  onCreateNewJSONProducer = async (event: onCreateNewJSONProducerType) => {
    const {
      table_id,
      username,
      instance,
      label,
      protocol,
      producerId,
      sctpStreamParameters,
      dataStreamType,
    } = event.data;

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
        data: {
          producerUsername: username,
          producerInstance: instance,
          producerType: "json",
          producerId,
          dataStreamType,
        },
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
    const { table_id, username, instance, producerType, producerId } =
      event.data;

    const msg = {
      type: "newProducerWasCreated",
      data: {
        producerType: producerType,
        producerId: producerId,
      },
    };
    this.io
      .to(`instance_${table_id}_${username}_${instance}`)
      .emit("message", msg);
  };

  onRemoveProducer = (event: onRemoveProducerType) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      dataStreamType,
    } = event.data;

    try {
      this.mediasoupCleanup.removeProducer(
        table_id,
        username,
        instance,
        producerType,
        producerId,
        dataStreamType
      );

      // Remove consumers
      this.mediasoupCleanup.removeConsumer(
        table_id,
        username,
        instance,
        producerType,
        producerId,
        dataStreamType
      );

      this.mediasoupCleanup.releaseWorkers(table_id);

      const msg = {
        type: "producerDisconnected",
        data: {
          producerUsername: username,
          producerInstance: instance,
          producerType,
          producerId,
          dataStreamType,
        },
      };

      this.io.to(`table_${table_id}`).emit("message", msg);
    } catch (error) {
      console.error(error);
    }
  };

  onRequestRemoveProducer = (event: onRequestRemoveProducerType) => {
    const { table_id, username, instance, producerType, producerId } =
      event.data;

    const msg = {
      type: "removeProducerRequested",
      data: {
        producerType,
        producerId,
      },
    };

    this.io
      .to(`instance_${table_id}_${username}_${instance}`)
      .emit("message", msg);
  };
}

export default ProducersController;
