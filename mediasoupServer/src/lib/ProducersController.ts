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

    if (
      !tableProducerTransports[tableId] ||
      !tableProducerTransports[tableId][username] ||
      !tableProducerTransports[tableId][username][instance]
    ) {
      const { transport, params } = await createWebRtcTransport(
        mediasoupRouter
      );

      if (!tableProducerTransports[tableId]) {
        tableProducerTransports[tableId] = {};
      }
      if (!tableProducerTransports[tableId][username]) {
        tableProducerTransports[tableId][username] = {};
      }

      tableProducerTransports[tableId][username][instance] = {
        transport,
        isConnected: false,
      };

      this.broadcaster.broadcastToInstance(tableId, username, instance, {
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
    const { tableId, username, instance } = event.header;
    const { dtlsParameters } = event.data;

    if (
      !tableProducerTransports[tableId] ||
      !tableProducerTransports[tableId][username] ||
      !tableProducerTransports[tableId][username][instance]
    ) {
      return;
    }

    if (!tableProducerTransports[tableId][username][instance].isConnected) {
      await tableProducerTransports[tableId][username][
        instance
      ].transport.connect({
        dtlsParameters: dtlsParameters,
      });
      tableProducerTransports[tableId][username][instance].isConnected = true;
    }

    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "producerConnected",
      data: "producer connected",
    });
  };

  onCreateNewProducer = async (event: onCreateNewProducerType) => {
    const { tableId, username, instance, producerType, producerId } =
      event.header;
    const { kind, rtpParameters } = event.data;

    if (
      !tableProducerTransports[tableId] ||
      !tableProducerTransports[tableId][username] ||
      !tableProducerTransports[tableId][username][instance]
    ) {
      return;
    }

    if (
      ((producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
        producerId &&
        tableProducers[tableId]?.[username]?.[instance]?.[producerType]?.[
          producerId
        ]) ||
      (producerType === "audio" &&
        tableProducers[tableId]?.[username]?.[instance]?.[producerType])
    ) {
      return;
    }

    const newProducer = await tableProducerTransports[tableId][username][
      instance
    ].transport.produce({
      kind,
      rtpParameters,
    });

    if (!tableProducers[tableId]) {
      tableProducers[tableId] = {};
    }
    if (!tableProducers[tableId][username]) {
      tableProducers[tableId][username] = {};
    }
    if (!tableProducers[tableId][username][instance]) {
      tableProducers[tableId][username][instance] = {};
    }
    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
      !tableProducers[tableId][username][instance][producerType]
    ) {
      tableProducers[tableId][username][instance][producerType] = {};
    }

    if (
      producerType === "camera" ||
      producerType === "screen" ||
      producerType === "screenAudio"
    ) {
      if (producerId) {
        tableProducers[tableId][username][instance][producerType]![producerId] =
          newProducer;
      }
    } else {
      tableProducers[tableId][username][instance][producerType] = newProducer;
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
    this.broadcaster.broadcastToTable(tableId, msg);
    this.broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "newProducerCallback",
      data: {
        id: newProducer.id,
      },
    });
  };

  onCreateNewJSONProducer = async (event: onCreateNewJSONProducerType) => {
    const { tableId, username, instance, producerId, dataStreamType } =
      event.header;
    const { label, protocol, sctpStreamParameters } = event.data;

    // Validate that the transport and producer type are correctly set up
    if (
      !tableProducerTransports[tableId] ||
      !tableProducerTransports[tableId][username] ||
      !tableProducerTransports[tableId][username][instance]
    ) {
      console.error(
        "Producer transport not found for the given table, username, or instance."
      );
      return;
    }

    // Check if a producer of this type already exists, and avoid creating a new one if it does
    if (
      tableProducers[tableId]?.[username]?.[instance]?.json?.[dataStreamType]
    ) {
      return;
    }

    // Now, produce the new JSON producer
    try {
      const transport =
        tableProducerTransports[tableId][username][instance].transport;
      const newProducer = await transport.produceData({
        label,
        protocol,
        // @ts-expect-error: I don't know but it works
        sctpStreamParameters,
      });

      // Make sure the producers object structure exists for the new producer
      if (!tableProducers[tableId]) {
        tableProducers[tableId] = {};
      }
      if (!tableProducers[tableId][username]) {
        tableProducers[tableId][username] = {};
      }
      if (!tableProducers[tableId][username][instance]) {
        tableProducers[tableId][username][instance] = {};
      }
      if (!tableProducers[tableId][username][instance].json) {
        tableProducers[tableId][username][instance].json = {};
      }

      // Store the new JSON producer under the appropriate keys
      if (producerId) {
        tableProducers[tableId][username][instance].json[dataStreamType] =
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

      this.broadcaster.broadcastToTable(tableId, msg);
      this.broadcaster.broadcastToInstance(tableId, username, instance, {
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
    const { tableId, username, instance, producerType, producerId } =
      event.header;

    const msg = {
      type: "newProducerWasCreated",
      header: {
        producerType: producerType,
        producerId: producerId,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  };

  onRemoveProducer = (event: onRemoveProducerType) => {
    const {
      tableId,
      username,
      instance,
      producerType,
      producerId,
      dataStreamType,
    } = event.header;

    try {
      this.mediasoupCleanup.removeProducer(
        tableId,
        username,
        instance,
        producerType,
        producerId,
        dataStreamType
      );

      // Remove consumers
      this.mediasoupCleanup.removeConsumer(
        tableId,
        username,
        instance,
        producerType,
        producerId,
        dataStreamType
      );

      this.mediasoupCleanup.releaseWorkers(tableId);

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

      this.broadcaster.broadcastToTable(tableId, msg);
    } catch (error) {
      console.error(error);
    }
  };

  onRequestRemoveProducer = (event: onRequestRemoveProducerType) => {
    const { tableId, username, instance, producerType, producerId } =
      event.header;

    const msg = {
      type: "removeProducerRequested",
      header: {
        producerType,
        producerId,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  };
}

export default ProducersController;
