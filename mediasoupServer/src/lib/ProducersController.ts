import createWebRtcTransport from "./createWebRtcTransport";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import MediasoupCleanup from "./MediasoupCleanup";
import Broadcaster from "./Broadcaster";
import {
  onConnectProducerTransportType,
  onCreateNewJSONProducerType,
  onCreateNewProducerType,
  onCreateProducerTransportType,
  onNewProducerCreatedType,
  onRemoveProducerType,
  onRequestRemoveProducerType,
  tableProducerTransports,
  tableProducers,
  workersMap,
} from "../typeConstant";

class ProducersController {
  constructor(
    private broadcaster: Broadcaster,
    private mediasoupCleanup: MediasoupCleanup
  ) {}

  onCreateProducerTransport = async (event: onCreateProducerTransportType) => {
    const { table_id, username, instance } = event.header;

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

      this.broadcaster.broadcastToInstance(table_id, username, instance, {
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
    const { table_id, username, instance } = event.header;
    const { dtlsParameters } = event.data;

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

    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "producerConnected",
      data: "producer connected",
    });
  };

  onCreateNewProducer = async (event: onCreateNewProducerType) => {
    const { table_id, username, instance, producerType, producerId } =
      event.header;
    const { kind, rtpParameters } = event.data;

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
      header: {
        producerUsername: username,
        producerInstance: instance,
        producerType,
        producerId,
      },
    };
    this.broadcaster.broadcastToTable(table_id, msg);
    this.broadcaster.broadcastToInstance(table_id, username, instance, {
      type: "newProducerCallback",
      data: {
        id: newProducer.id,
      },
    });
  };

  onCreateNewJSONProducer = async (event: onCreateNewJSONProducerType) => {
    const { table_id, username, instance, producerId, dataStreamType } =
      event.header;
    const { label, protocol, sctpStreamParameters } = event.data;

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
        header: {
          producerUsername: username,
          producerInstance: instance,
          producerType: "json",
          producerId,
          dataStreamType,
        },
      };

      this.broadcaster.broadcastToTable(table_id, msg);
      this.broadcaster.broadcastToInstance(table_id, username, instance, {
        type: "newJSONProducerCallback",
        data: {
          id: newProducer.id,
        },
      });
    } catch (error) {
      console.error("Error creating JSON producer:", error);
    }
  };

  onNewProducerCreated = (event: onNewProducerCreatedType) => {
    const { table_id, username, instance, producerType, producerId } =
      event.header;

    const msg = {
      type: "newProducerWasCreated",
      header: {
        producerType: producerType,
        producerId: producerId,
      },
    };

    this.broadcaster.broadcastToInstance(table_id, username, instance, msg);
  };

  onRemoveProducer = (event: onRemoveProducerType) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      dataStreamType,
    } = event.header;

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
        header: {
          producerUsername: username,
          producerInstance: instance,
          producerType,
          producerId,
          dataStreamType,
        },
      };

      this.broadcaster.broadcastToTable(table_id, msg);
    } catch (error) {
      console.error(error);
    }
  };

  onRequestRemoveProducer = (event: onRequestRemoveProducerType) => {
    const { table_id, username, instance, producerType, producerId } =
      event.header;

    const msg = {
      type: "removeProducerRequested",
      header: {
        producerType,
        producerId,
      },
    };

    this.broadcaster.broadcastToInstance(table_id, username, instance, msg);
  };
}

export default ProducersController;
