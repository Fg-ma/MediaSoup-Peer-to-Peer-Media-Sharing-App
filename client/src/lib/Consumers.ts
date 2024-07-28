import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

class Consumers {
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
  private remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
    };
  }>;
  private createConsumerBundle: (
    trackUsername: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => void;
  private subBtnRef: React.RefObject<HTMLButtonElement>;

  constructor(
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    consumerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,
    remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        camera?: { [cameraId: string]: MediaStreamTrack };
        screen?: { [screenId: string]: MediaStreamTrack };
        audio?: MediaStreamTrack | undefined;
      };
    }>,
    createConsumerBundle: (
      trackUsername: string,
      remoteCameraStreams: {
        [screenId: string]: MediaStream;
      },
      remoteScreenStreams: {
        [screenId: string]: MediaStream;
      },
      remoteAudioStream: MediaStream | undefined
    ) => void,
    subBtnRef: React.RefObject<HTMLButtonElement>
  ) {
    this.table_id = table_id;
    this.username = username;
    this.socket = socket;
    this.device = device;
    this.consumerTransport = consumerTransport;
    this.remoteTracksMap = remoteTracksMap;
    this.createConsumerBundle = createConsumerBundle;
    this.subBtnRef = subBtnRef;
  }

  async onSubscribed(event: {
    type: string;
    data: {
      [username: string]: {
        camera?: {
          [cameraId: string]: {
            producerId: string;
            id: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screen?: {
          [screenId: string]: {
            producerId: string;
            id: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        audio?: {
          producerId: string;
          id: string;
          kind: "audio" | "video" | undefined;
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
      };
    };
  }) {
    if (!this.consumerTransport.current) {
      console.error("No consumer transport available!");
      return;
    }
    if (this.subBtnRef.current) {
      this.subBtnRef.current.disabled = false;
    }
    const subscriptions = event.data;

    for (const producerUsername in subscriptions) {
      let newRemoteTrack: {
        camera?: { [cameraId: string]: MediaStreamTrack };
        screen?: { [screenId: string]: MediaStreamTrack };
        audio?: MediaStreamTrack;
      } = {};

      if (subscriptions[producerUsername].camera) {
        if (!newRemoteTrack.camera) {
          newRemoteTrack.camera = {};
        }
        for (const key in subscriptions[producerUsername].camera) {
          const subscriptionCameraData =
            subscriptions[producerUsername].camera![key];
          const { producerId, id, kind, rtpParameters } =
            subscriptionCameraData;

          const consumer = await this.consumerTransport.current.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });
          newRemoteTrack.camera[key] = consumer.track;
        }
      }

      if (subscriptions[producerUsername].screen) {
        if (!newRemoteTrack.screen) {
          newRemoteTrack.screen = {};
        }
        for (const key in subscriptions[producerUsername].screen) {
          const subscriptionCameraData =
            subscriptions[producerUsername].screen![key];
          const { producerId, id, kind, rtpParameters } =
            subscriptionCameraData;

          const consumer = await this.consumerTransport.current.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });
          newRemoteTrack.screen[key] = consumer.track;
        }
      }

      if (subscriptions[producerUsername].audio) {
        const subscriptionAudioData = subscriptions[producerUsername].audio!;
        const { producerId, id, kind, rtpParameters } = subscriptionAudioData;

        const consumer = await this.consumerTransport.current.consume({
          id,
          producerId,
          kind,
          rtpParameters,
        });
        newRemoteTrack.audio = consumer.track;
      }

      this.remoteTracksMap.current[producerUsername] = newRemoteTrack;
    }
  }

  async onConsumerTransportCreated(event: {
    type: "producerTransportCreated";
    params: {
      id: string;
      iceParameters: mediasoup.types.IceParameters;
      iceCandidates: mediasoup.types.IceCandidate[];
      dtlsParameters: mediasoup.types.DtlsParameters;
    };
    error?: unknown;
  }) {
    if (event.error) {
      console.error("On consumer transport create error: ", event.error);
    }

    if (!this.device.current) {
      console.error("No device found");
      return;
    }

    this.consumerTransport.current = this.device.current.createRecvTransport(
      event.params
    );

    this.consumerTransport.current.on(
      "connect",
      ({ dtlsParameters }, callback, errback) => {
        const msg = {
          type: "connectConsumerTransport",
          transportId: this.consumerTransport.current?.id,
          dtlsParameters,
          table_id: this.table_id.current,
          username: this.username.current,
        };

        this.socket.current.send(msg);
        this.socket.current.on("message", (event) => {
          if (event.type === "consumerTransportConnected") {
            callback();
          }
        });
      }
    );

    this.consumerTransport.current.on(
      "connectionstatechange",
      async (state) => {
        switch (state) {
          case "connecting":
            break;
          case "connected":
            Object.entries(this.remoteTracksMap.current).forEach(
              ([trackUsername, tracks]) => {
                let remoteCameraStreams: { [cameraId: string]: MediaStream } =
                  {};
                if (this.remoteTracksMap.current[trackUsername]?.camera) {
                  for (const key in this.remoteTracksMap.current[trackUsername]
                    .camera) {
                    const remoteCameraStream = new MediaStream();
                    remoteCameraStream.addTrack(
                      this.remoteTracksMap.current[trackUsername].camera![key]
                    );
                    remoteCameraStreams[key] = remoteCameraStream;
                  }
                }

                let remoteScreenStreams: { [screenId: string]: MediaStream } =
                  {};
                if (this.remoteTracksMap.current[trackUsername]?.screen) {
                  for (const key in this.remoteTracksMap.current[trackUsername]
                    .screen) {
                    const remoteScreenStream = new MediaStream();
                    remoteScreenStream.addTrack(
                      this.remoteTracksMap.current[trackUsername].screen![key]
                    );
                    remoteScreenStreams[key] = remoteScreenStream;
                  }
                }

                let remoteAudioStream: MediaStream | undefined = undefined;
                if (
                  this.remoteTracksMap.current[trackUsername] &&
                  this.remoteTracksMap.current[trackUsername].audio
                ) {
                  remoteAudioStream = new MediaStream();
                  remoteAudioStream.addTrack(
                    this.remoteTracksMap.current[trackUsername].audio!
                  );
                }

                this.createConsumerBundle(
                  trackUsername,
                  remoteCameraStreams,
                  remoteScreenStreams,
                  remoteAudioStream
                );
              }
            );
            const msg = {
              type: "resume",
              table_id: this.table_id.current,
              username: this.username.current,
            };
            this.socket.current.send(msg);
            break;
          case "failed":
            this.consumerTransport.current?.close();
            break;
          default:
            break;
        }
      }
    );

    const { rtpCapabilities } = this.device.current;
    const msg = {
      type: "consume",
      rtpCapabilities: rtpCapabilities,
      table_id: this.table_id.current,
      username: this.username.current,
    };
    this.socket.current.send(msg);
  }

  async onNewConsumerSubscribed(event: {
    type: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
    data: {
      producerId: string;
      id: string;
      kind: "audio" | "video" | undefined;
      rtpParameters: mediasoup.types.RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  }) {
    if (event.producerUsername === this.username.current) {
      return;
    }

    const { producerId, id, kind, rtpParameters } = event.data;
    const consumer = await this.consumerTransport.current?.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });

    if (!consumer) {
      console.error("Failed to create camera consumer!");
      return;
    }

    if (!this.remoteTracksMap.current[event.producerUsername]) {
      this.remoteTracksMap.current[event.producerUsername] = {};
    }
    if (event.consumerType === "camera" || event.consumerType === "screen") {
      if (
        !this.remoteTracksMap.current[event.producerUsername][
          event.consumerType
        ]
      ) {
        this.remoteTracksMap.current[event.producerUsername][
          event.consumerType
        ] = {};
      }
      if (event.consumerId) {
        this.remoteTracksMap.current[event.producerUsername][
          event.consumerType as "camera" | "screen"
        ]![event.consumerId] = consumer.track;
      }
    } else {
      this.remoteTracksMap.current[event.producerUsername].audio =
        consumer.track;
    }

    if (
      Object.keys(this.remoteTracksMap.current[event.producerUsername])
        .length === 1
    ) {
      let remoteCameraStreams: { [cameraId: string]: MediaStream } = {};
      if (this.remoteTracksMap.current[event.producerUsername]?.camera) {
        for (const key in this.remoteTracksMap.current[event.producerUsername]
          .camera) {
          const remoteCameraStream = new MediaStream();
          remoteCameraStream.addTrack(
            this.remoteTracksMap.current[event.producerUsername].camera![key]
          );
          remoteCameraStreams[key] = remoteCameraStream;
        }
      }

      let remoteScreenStreams: { [screenId: string]: MediaStream } = {};
      if (this.remoteTracksMap.current[event.producerUsername]?.screen) {
        for (const key in this.remoteTracksMap.current[event.producerUsername]
          .screen) {
          const remoteScreenStream = new MediaStream();
          remoteScreenStream.addTrack(
            this.remoteTracksMap.current[event.producerUsername].screen![key]
          );
          remoteScreenStreams[key] = remoteScreenStream;
        }
      }

      let remoteAudioStream: MediaStream | undefined = undefined;
      if (
        this.remoteTracksMap.current[event.producerUsername] &&
        this.remoteTracksMap.current[event.producerUsername].audio
      ) {
        remoteAudioStream = new MediaStream();
        remoteAudioStream.addTrack(
          this.remoteTracksMap.current[event.producerUsername].audio!
        );
      }
    }

    const msg = {
      type: "resume",
      table_id: this.table_id.current,
      username: this.username.current,
    };
    this.socket.current.send(msg);

    const message = {
      type: "newConsumerCreated",
      username: this.username.current,
      table_id: this.table_id.current,
      producerUsername: event.producerUsername,
      consumerId: event.consumerId,
      consumerType: event.consumerType,
    };
    this.socket.current.emit("message", message);
  }
}

export default Consumers;
