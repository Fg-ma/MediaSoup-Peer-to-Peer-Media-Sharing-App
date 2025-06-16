import { z } from "zod";
import createWebRtcTransport from "./createWebRtcTransport";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import MediasoupCleanup from "./MediasoupCleanup";
import Broadcaster from "./Broadcaster";
import {
  DataStreamTypesArray,
  ProducerTypesArray,
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
import { sanitizationUtils } from "src";

class ProducersController {
  constructor(
    private broadcaster: Broadcaster,
    private mediasoupCleanup: MediasoupCleanup
  ) {}

  private createProducerTransportSchema = z.object({
    type: z.literal("createProducerTransport"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onCreateProducerTransport = async (event: onCreateProducerTransportType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onCreateProducerTransportType;
    const validation = this.createProducerTransportSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance } = safeEvent.header;

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

  private dtlsParametersSchema = z.object({
    role: z.enum(["auto", "client", "server"]).optional(),
    fingerprints: z.array(
      z.object({
        algorithm: z.enum([
          "sha-1",
          "sha-224",
          "sha-256",
          "sha-384",
          "sha-512",
        ]),
        value: z.string(),
      })
    ),
  });

  private connectProducerTransportSchema = z.object({
    type: z.literal("connectProducerTransport"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
    data: z.object({
      dtlsParameters: this.dtlsParametersSchema,
    }),
  });

  onConnectProducerTransport = async (
    event: onConnectProducerTransportType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, {
      value: ":",
    }) as onConnectProducerTransportType;
    const validation = this.connectProducerTransportSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance } = safeEvent.header;
    const { dtlsParameters } = safeEvent.data;

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

  private rtpParametersSchema = z.object({
    mid: z.string().optional(),
    codecs: z.array(
      z.object({
        mimeType: z.string(),
        payloadType: z.number(),
        clockRate: z.number(),
        channels: z.number().optional(),
        parameters: z.any().optional(),
        rtcpFeedback: z
          .array(
            z.object({
              type: z.string(),
              parameter: z.string().optional(),
            })
          )
          .optional(),
      })
    ),
    headerExtensions: z
      .array(
        z.object({
          uri: z.enum([
            "urn:ietf:params:rtp-hdrext:sdes:mid",
            "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id",
            "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id",
            "http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07",
            "urn:ietf:params:rtp-hdrext:framemarking",
            "urn:ietf:params:rtp-hdrext:ssrc-audio-level",
            "urn:3gpp:video-orientation",
            "urn:ietf:params:rtp-hdrext:toffset",
            "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
            "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
            "http://www.webrtc.org/experiments/rtp-hdrext/abs-capture-time",
            "http://www.webrtc.org/experiments/rtp-hdrext/playout-delay",
          ]),
          id: z.number(),
          encrypt: z.boolean().optional(),
          parameters: z.any().optional(),
        })
      )
      .optional(),
    encodings: z
      .array(
        z.object({
          ssrc: z.number().optional(),
          rid: z.string().optional(),
          codecPayloadType: z.number().optional(),
          rtx: z
            .object({
              ssrc: z.number(),
            })
            .optional(),
          dtx: z.boolean().optional(),
          scalabilityMode: z.string().optional(),
          scaleResolutionDownBy: z.number().optional(),
          maxBitrate: z.number().optional(),
        })
      )
      .optional(),
    rtcp: z
      .object({
        cname: z.string().optional(),
        reducedSize: z.boolean().optional(),
      })
      .optional(),
  });

  private createNewProducerSchema = z.object({
    type: z.literal("createNewProducer"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
    }),
    data: z.object({
      transportId: z.string(),
      kind: z.enum(["audio", "video"]),
      rtpParameters: this.rtpParametersSchema,
    }),
  });

  onCreateNewProducer = async (event: onCreateNewProducerType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, {
      uri: ":/",
      mimeType: "/+",
      parameters: ":/.+=-",
    }) as onCreateNewProducerType;
    const validation = this.createNewProducerSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;
    const { kind, rtpParameters } = safeEvent.data;

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

  private sctpParametersSchema = z.object({
    port: z.number().optional(),
    OS: z.number().optional(),
    MIS: z.number().optional(),
    maxMessageSize: z.number().optional(),
    streamId: z.number().optional(),
    ordered: z.boolean().optional(),
  });

  private createNewJSONProducerSchema = z.object({
    type: z.literal("createNewJSONProducer"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.literal("json"),
      producerId: z.string(),
      dataStreamType: z.enum(DataStreamTypesArray),
    }),
    data: z.object({
      transportId: z.string(),
      label: z.string(),
      protocol: z.literal("json"),
      sctpStreamParameters: this.sctpParametersSchema,
    }),
  });

  onCreateNewJSONProducer = async (event: onCreateNewJSONProducerType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onCreateNewJSONProducerType;
    const validation = this.createNewJSONProducerSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerId, dataStreamType } =
      safeEvent.header;
    const { label, protocol, sctpStreamParameters } = safeEvent.data;

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

  private newProducerCreatedSchema = z.object({
    type: z.literal("newProducerCreated"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
    }),
  });

  onNewProducerCreated = (event: onNewProducerCreatedType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onNewProducerCreatedType;
    const validation = this.newProducerCreatedSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;

    const msg = {
      type: "newProducerWasCreated",
      header: {
        producerType: producerType,
        producerId: producerId,
      },
    };

    this.broadcaster.broadcastToInstance(tableId, username, instance, msg);
  };

  private removeProducerSchema = z.object({
    type: z.literal("removeProducer"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
      dataStreamType: z.enum(DataStreamTypesArray).optional(),
    }),
  });

  onRemoveProducer = (event: onRemoveProducerType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRemoveProducerType;
    const validation = this.removeProducerSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      username,
      instance,
      producerType,
      producerId,
      dataStreamType,
    } = safeEvent.header;

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

  private requestRemoveProducerSchema = z.object({
    type: z.literal("requestRemoveProducer"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
    }),
  });

  onRequestRemoveProducer = (event: onRequestRemoveProducerType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestRemoveProducerType;
    const validation = this.requestRemoveProducerSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;

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
