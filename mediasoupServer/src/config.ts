import {
  RtpCodecCapability,
  TransportListenIp,
  WorkerLogTag,
} from "mediasoup/node/lib/types";
import os from "os";

export const config = {
  listenIP: "0.0.0.0",
  listenPort: 3016,

  mediasoup: {
    numWorkers: Object.keys(os.cpus()).length,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 19999,
      logLevel: "debug",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
      ] as unknown as WorkerLogTag[],
    },
    router: {
      mediaCodes: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ] as RtpCodecCapability[],
    },
    // weprtctransport settings
    webRtcTransport: {
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: "127.0.0.1",
        },
      ] as TransportListenIp[],
      maxIncomeBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000,
      numSctpStreams: {
        OS: 1024,
        MIS: 1024,
      },
    },
    pipeTransport: {
      listenIps: [
        {
          ip: "0.0.0.0",
        },
      ] as TransportListenIp[],
      enableSctp: true,
      numSctpStreams: {
        OS: 1024,
        MIS: 1024,
      },
      maxIncomeBitrate: 1500000,
    },
  },
} as const;
