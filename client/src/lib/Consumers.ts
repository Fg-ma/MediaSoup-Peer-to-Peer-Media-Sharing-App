import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

class Consumers {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;

  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private instance: React.MutableRefObject<string>;

  private subBtnRef: React.RefObject<HTMLButtonElement>;

  private consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;

  private remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: {
        camera?: { [cameraId: string]: MediaStreamTrack };
        screen?: { [screenId: string]: MediaStreamTrack };
        audio?: MediaStreamTrack | undefined;
      };
    };
  }>;

  private createConsumerBundle: (
    trackUsername: string,
    trackInstance: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,

    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    instance: React.MutableRefObject<string>,

    subBtnRef: React.RefObject<HTMLButtonElement>,

    consumerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,

    remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera?: { [cameraId: string]: MediaStreamTrack };
          screen?: { [screenId: string]: MediaStreamTrack };
          audio?: MediaStreamTrack | undefined;
        };
      };
    }>,

    createConsumerBundle: (
      trackUsername: string,
      trackInstance: string,
      remoteCameraStreams: {
        [screenId: string]: MediaStream;
      },
      remoteScreenStreams: {
        [screenId: string]: MediaStream;
      },
      remoteAudioStream: MediaStream | undefined
    ) => void
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.subBtnRef = subBtnRef;
    this.consumerTransport = consumerTransport;
    this.remoteTracksMap = remoteTracksMap;
    this.createConsumerBundle = createConsumerBundle;
  }

  async onSubscribed(event: {
    type: string;
    data: {
      [username: string]: {
        [instance: string]: {
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
      for (const producerInstance in subscriptions[producerUsername]) {
        let newRemoteTrack: {
          camera?: { [cameraId: string]: MediaStreamTrack };
          screen?: { [screenId: string]: MediaStreamTrack };
          audio?: MediaStreamTrack;
        } = {};

        if (subscriptions[producerUsername][producerInstance].camera) {
          if (!newRemoteTrack.camera) {
            newRemoteTrack.camera = {};
          }
          for (const key in subscriptions[producerUsername][producerInstance]
            .camera) {
            const subscriptionCameraData =
              subscriptions[producerUsername][producerInstance].camera![key];
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

        if (subscriptions[producerUsername][producerInstance].screen) {
          if (!newRemoteTrack.screen) {
            newRemoteTrack.screen = {};
          }
          for (const key in subscriptions[producerUsername][producerInstance]
            .screen) {
            const subscriptionCameraData =
              subscriptions[producerUsername][producerInstance].screen![key];
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

        if (subscriptions[producerUsername][producerInstance].audio) {
          const subscriptionAudioData =
            subscriptions[producerUsername][producerInstance].audio!;
          const { producerId, id, kind, rtpParameters } = subscriptionAudioData;

          const consumer = await this.consumerTransport.current.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });
          newRemoteTrack.audio = consumer.track;
        }

        if (!this.remoteTracksMap.current[producerUsername]) {
          this.remoteTracksMap.current[producerUsername] = {};
        }
        this.remoteTracksMap.current[producerUsername][producerInstance] =
          newRemoteTrack;
      }
    }
  }

  async onConsumerTransportCreated(event: {
    type: "consumerTransportCreated";
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
          instance: this.instance.current,
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
            for (const username in this.remoteTracksMap.current) {
              for (const instance in this.remoteTracksMap.current[username]) {
                let remoteCameraStreams: {
                  [cameraId: string]: MediaStream;
                } = {};
                for (const key in this.remoteTracksMap.current[username][
                  instance
                ].camera) {
                  const remoteCameraStream = new MediaStream();
                  remoteCameraStream.addTrack(
                    this.remoteTracksMap.current[username][instance].camera![
                      key
                    ]
                  );
                  remoteCameraStreams[key] = remoteCameraStream;
                }

                let remoteScreenStreams: {
                  [screenId: string]: MediaStream;
                } = {};
                for (const key in this.remoteTracksMap.current[username][
                  instance
                ].screen) {
                  const remoteScreenStream = new MediaStream();
                  remoteScreenStream.addTrack(
                    this.remoteTracksMap.current[username][instance].screen![
                      key
                    ]
                  );
                  remoteScreenStreams[key] = remoteScreenStream;
                }

                let remoteAudioStream: MediaStream | undefined = undefined;
                if (this.remoteTracksMap.current[username][instance].audio) {
                  remoteAudioStream = new MediaStream();
                  remoteAudioStream.addTrack(
                    this.remoteTracksMap.current[username][instance].audio!
                  );
                }

                this.createConsumerBundle(
                  username,
                  instance,
                  remoteCameraStreams,
                  remoteScreenStreams,
                  remoteAudioStream
                );
              }
            }

            const msg = {
              type: "resume",
              table_id: this.table_id.current,
              username: this.username.current,
              instance: this.instance.current,
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
      instance: this.instance.current,
    };

    this.socket.current.send(msg);
  }

  async onNewConsumerSubscribed(event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
    consumerId?: string;
    consumerType: "camera" | "screen" | "audio";
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
    if (
      !this.remoteTracksMap.current[event.producerUsername][
        event.producerInstance
      ]
    ) {
      this.remoteTracksMap.current[event.producerUsername][
        event.producerInstance
      ] = {};
    }
    if (event.consumerType === "camera" || event.consumerType === "screen") {
      if (
        !this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ][event.consumerType]
      ) {
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ][event.consumerType] = {};
      }

      if (event.consumerId) {
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ][event.consumerType]![event.consumerId] = consumer.track;
      }
    } else {
      this.remoteTracksMap.current[event.producerUsername][
        event.producerInstance
      ].audio = consumer.track;
    }

    if (
      Object.keys(
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ] || {}
      ).length === 1 &&
      (Object.keys(
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].camera || {}
      ).length === 1 ||
        Object.keys(
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ].screen || {}
        ).length === 1 ||
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].audio)
    ) {
      let remoteCameraStreams: { [cameraId: string]: MediaStream } = {};
      if (
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ]?.camera
      ) {
        for (const key in this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].camera) {
          const remoteCameraStream = new MediaStream();
          remoteCameraStream.addTrack(
            this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ].camera![key]
          );
          remoteCameraStreams[key] = remoteCameraStream;
        }
      }

      let remoteScreenStreams: { [screenId: string]: MediaStream } = {};
      if (
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ]?.screen
      ) {
        for (const key in this.remoteTracksMap.current[event.producerUsername]
          .screen) {
          const remoteScreenStream = new MediaStream();
          remoteScreenStream.addTrack(
            this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ].screen![key]
          );
          remoteScreenStreams[key] = remoteScreenStream;
        }
      }

      let remoteAudioStream: MediaStream | undefined = undefined;
      if (
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ] &&
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].audio
      ) {
        remoteAudioStream = new MediaStream();
        remoteAudioStream.addTrack(
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ].audio!
        );
      }

      this.createConsumerBundle(
        event.producerUsername,
        event.producerInstance,
        remoteCameraStreams,
        remoteScreenStreams,
        remoteAudioStream
      );
    }

    const msg = {
      type: "resume",
      table_id: this.table_id.current,
      username: this.username.current,
      instance: this.instance.current,
    };
    this.socket.current.send(msg);

    const message = {
      type: "newConsumerCreated",
      table_id: this.table_id.current,
      username: this.username.current,
      instance: this.instance.current,
      producerUsername: event.producerUsername,
      producerInstance: event.producerInstance,
      consumerId: event.consumerId,
      consumerType: event.consumerType,
    };
    this.socket.current.emit("message", message);
  }
}

export default Consumers;
