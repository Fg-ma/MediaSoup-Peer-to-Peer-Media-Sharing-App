import React from "react";
import { types } from "mediasoup-client";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";
import { RtpParameters } from "mediasoup-client/lib/RtpParameters";
import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { Socket } from "socket.io-client";
import {
  DataStreamTypes,
  RemoteDataStreamsType,
  RemoteMediaType,
} from "../context/mediaContext/typeConstant";

class ConsumersController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<types.Device | undefined>,

    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private consumerTransport: React.MutableRefObject<
      types.Transport<types.AppData> | undefined
    >,

    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,

    private setUpEffectContext: (
      username: string,
      instance: string,
      cameraIds: (string | undefined)[],
      screenIds: (string | undefined)[],
      screenAudioIds: (string | undefined)[]
    ) => void,

    private createConsumerBundle: (
      trackUsername: string,
      trackInstance: string,
      remoteCameraStreams: {
        [screenId: string]: MediaStream;
      },
      remoteScreenStreams: {
        [screenId: string]: MediaStream;
      },
      remoteScreenAudioStreams: {
        [screenId: string]: MediaStream;
      },
      remoteAudioStream: MediaStream | undefined
    ) => void
  ) {}

  async onSubscribed(event: {
    type: "subscribed";
    data: {
      [username: string]: {
        [instance: string]: {
          camera?: {
            [cameraId: string]: {
              id: string;
              producerId: string;
              kind: "audio" | "video" | undefined;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rtpParameters: any;
              type: string;
              producerPaused: boolean;
            };
          };
          screen?: {
            [screenId: string]: {
              id: string;
              producerId: string;
              kind: "audio" | "video" | undefined;
              rtpParameters: RtpParameters;
              type: string;
              producerPaused: boolean;
            };
          };
          screenAudio?: {
            [screenAudioId: string]: {
              id: string;
              producerId: string;
              kind: "audio" | "video" | undefined;
              rtpParameters: RtpParameters;
              type: string;
              producerPaused: boolean;
            };
          };
          audio?: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: RtpParameters;
            type: string;
            producerPaused: boolean;
          };
          json?: {
            [dataStreamType in DataStreamTypes]?: {
              id: string;
              producerId: string;
              label: string;
              sctpStreamParameters: SctpStreamParameters;
              type: string;
              producerPaused: boolean;
              protocol: string;
            };
          };
        };
      };
    };
  }) {
    if (!this.consumerTransport.current) {
      console.error("No consumer transport available!");
      return;
    }

    const subscriptions = event.data;

    for (const producerUsername in subscriptions) {
      for (const producerInstance in subscriptions[producerUsername]) {
        const newRemoteTrack: {
          camera?: { [cameraId: string]: MediaStreamTrack };
          screen?: { [screenId: string]: MediaStreamTrack };
          screenAudio?: { [screenAudioId: string]: MediaStreamTrack };
          audio?: MediaStreamTrack;
        } = {};
        const newRemoteDataStream: {
          [dataStreamType in DataStreamTypes]?: DataConsumer;
        } = {};

        if (subscriptions[producerUsername][producerInstance].camera) {
          if (!newRemoteTrack.camera) {
            newRemoteTrack.camera = {};
          }
          for (const key in subscriptions[producerUsername][producerInstance]
            .camera) {
            const subscriptionCameraData =
              subscriptions[producerUsername][producerInstance].camera![key];
            const { id, producerId, kind, rtpParameters } =
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
            const { id, producerId, kind, rtpParameters } =
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

        if (subscriptions[producerUsername][producerInstance].screenAudio) {
          if (!newRemoteTrack.screenAudio) {
            newRemoteTrack.screenAudio = {};
          }
          for (const key in subscriptions[producerUsername][producerInstance]
            .screenAudio) {
            const subscriptionCameraData =
              subscriptions[producerUsername][producerInstance].screenAudio![
                key
              ];
            const { id, producerId, kind, rtpParameters } =
              subscriptionCameraData;

            const consumer = await this.consumerTransport.current.consume({
              id,
              producerId,
              kind,
              rtpParameters,
            });
            newRemoteTrack.screenAudio[key] = consumer.track;
          }
        }

        if (subscriptions[producerUsername][producerInstance].audio) {
          const subscriptionAudioData =
            subscriptions[producerUsername][producerInstance].audio!;
          const { id, producerId, kind, rtpParameters } = subscriptionAudioData;

          const consumer = await this.consumerTransport.current.consume({
            id,
            producerId,
            kind,
            rtpParameters,
          });
          newRemoteTrack.audio = consumer.track;
        }

        if (subscriptions[producerUsername][producerInstance].json) {
          for (const jsonId in subscriptions[producerUsername][producerInstance]
            .json) {
            const subscriptionJSONData =
              subscriptions[producerUsername][producerInstance].json![
                jsonId as DataStreamTypes
              ];
            if (!subscriptionJSONData) {
              continue;
            }
            const { id, producerId, sctpStreamParameters, label, protocol } =
              subscriptionJSONData;

            const consumer = await this.consumerTransport.current.consumeData({
              id,
              dataProducerId: producerId,
              sctpStreamParameters,
              label,
              protocol,
            });
            newRemoteDataStream[jsonId as DataStreamTypes] = consumer;
          }
        }

        if (!this.remoteMedia.current[producerUsername]) {
          this.remoteMedia.current[producerUsername] = {};
        }
        this.remoteMedia.current[producerUsername][producerInstance] =
          newRemoteTrack;
        if (!this.remoteDataStreams.current[producerUsername]) {
          this.remoteDataStreams.current[producerUsername] = {};
        }
        this.remoteDataStreams.current[producerUsername][producerInstance] =
          newRemoteDataStream;
      }
    }
  }

  async onConsumerTransportCreated(event: {
    type: "consumerTransportCreated";
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
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
      ({ dtlsParameters }, callback, _errback) => {
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
          case "connecting": {
            break;
          }
          case "connected": {
            for (const username in this.remoteMedia.current) {
              for (const instance in this.remoteMedia.current[username]) {
                const remoteCameraStreams: {
                  [cameraId: string]: MediaStream;
                } = {};
                for (const key in this.remoteMedia.current[username][instance]
                  .camera) {
                  const remoteCameraStream = new MediaStream();
                  remoteCameraStream.addTrack(
                    this.remoteMedia.current[username][instance].camera![key]
                  );
                  remoteCameraStreams[key] = remoteCameraStream;
                }

                const remoteScreenStreams: {
                  [screenId: string]: MediaStream;
                } = {};
                for (const key in this.remoteMedia.current[username][instance]
                  .screen) {
                  const remoteScreenStream = new MediaStream();
                  remoteScreenStream.addTrack(
                    this.remoteMedia.current[username][instance].screen![key]
                  );
                  remoteScreenStreams[key] = remoteScreenStream;
                }

                const remoteScreenAudioStreams: {
                  [screenId: string]: MediaStream;
                } = {};
                for (const key in this.remoteMedia.current[username][instance]
                  .screenAudio) {
                  const remoteScreenAudioStream = new MediaStream();
                  remoteScreenAudioStream.addTrack(
                    this.remoteMedia.current[username][instance].screenAudio![
                      key
                    ]
                  );
                  remoteScreenAudioStreams[key] = remoteScreenAudioStream;
                }

                let remoteAudioStream: MediaStream | undefined = undefined;
                if (this.remoteMedia.current[username][instance].audio) {
                  remoteAudioStream = new MediaStream();
                  remoteAudioStream.addTrack(
                    this.remoteMedia.current[username][instance].audio!
                  );
                }

                this.createConsumerBundle(
                  username,
                  instance,
                  remoteCameraStreams,
                  remoteScreenStreams,
                  remoteScreenAudioStreams,
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
          }
          case "failed": {
            this.consumerTransport.current?.close();
            break;
          }
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
    type: "newConsumerSubscribed";
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
    data: {
      id: string;
      producerId: string;
      kind: "audio" | "video" | undefined;
      rtpParameters: types.RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  }) {
    if (event.producerInstance === this.instance.current) {
      return;
    }

    const { id, producerId, kind, rtpParameters } = event.data;
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

    if (!this.remoteMedia.current[event.producerUsername]) {
      this.remoteMedia.current[event.producerUsername] = {};
    }
    if (
      !this.remoteMedia.current[event.producerUsername][event.producerInstance]
    ) {
      this.remoteMedia.current[event.producerUsername][event.producerInstance] =
        {};
    }
    if (
      event.producerType === "camera" ||
      event.producerType === "screen" ||
      event.producerType === "screenAudio"
    ) {
      if (
        !this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ][event.producerType]
      ) {
        this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ][event.producerType] = {};
      }

      if (event.producerId) {
        this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ][event.producerType]![event.producerId] = consumer.track;
      }
    } else {
      this.remoteMedia.current[event.producerUsername][
        event.producerInstance
      ].audio = consumer.track;
    }

    this.setUpEffectContext(
      event.producerUsername,
      event.producerInstance,
      event.producerType === "camera" ? [event.producerId] : [],
      event.producerType === "screen" ? [event.producerId] : [],
      event.producerType === "screenAudio" ? [event.producerId] : []
    );

    if (
      Object.keys(
        this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ] || {}
      ).length === 1 &&
      (Object.keys(
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          .camera || {}
      ).length === 1 ||
        Object.keys(
          this.remoteMedia.current[event.producerUsername][
            event.producerInstance
          ].screen || {}
        ).length === 1 ||
        Object.keys(
          this.remoteMedia.current[event.producerUsername][
            event.producerInstance
          ].screenAudio || {}
        ).length === 1 ||
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          .audio)
    ) {
      const remoteCameraStreams: { [cameraId: string]: MediaStream } = {};
      if (
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          ?.camera
      ) {
        for (const key in this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ].camera) {
          const remoteCameraStream = new MediaStream();
          remoteCameraStream.addTrack(
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].camera![key]
          );
          remoteCameraStreams[key] = remoteCameraStream;
        }
      }

      const remoteScreenStreams: { [screenId: string]: MediaStream } = {};
      if (
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          ?.screen
      ) {
        for (const key in this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ].screen) {
          const remoteScreenStream = new MediaStream();
          remoteScreenStream.addTrack(
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].screen![key]
          );
          remoteScreenStreams[key] = remoteScreenStream;
        }
      }

      const remoteScreenAudioStreams: { [screenAudioId: string]: MediaStream } =
        {};
      if (
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          ?.screenAudio
      ) {
        for (const key in this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ].screenAudio) {
          const remoteScreenAudioStream = new MediaStream();
          remoteScreenAudioStream.addTrack(
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].screenAudio![key]
          );
          remoteScreenAudioStreams[key] = remoteScreenAudioStream;
        }
      }

      let remoteAudioStream: MediaStream | undefined = undefined;
      if (
        this.remoteMedia.current[event.producerUsername][
          event.producerInstance
        ] &&
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          .audio
      ) {
        remoteAudioStream = new MediaStream();
        remoteAudioStream.addTrack(
          this.remoteMedia.current[event.producerUsername][
            event.producerInstance
          ].audio!
        );
      }

      this.createConsumerBundle(
        event.producerUsername,
        event.producerInstance,
        remoteCameraStreams,
        remoteScreenStreams,
        remoteScreenAudioStreams,
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
      producerId: event.producerId,
      producerType: event.producerType,
    };
    this.socket.current.emit("message", message);
  }

  async onNewJSONConsumerSubscribed(event: {
    type: "newJSONConsumerSubscribed";
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "json";
    data: {
      id: string;
      producerId: string;
      label: string;
      sctpStreamParameters: SctpStreamParameters;
      type: string;
      producerPaused: boolean;
      protocol: string;
    };
  }) {
    if (event.producerInstance === this.instance.current) {
      return;
    }

    const { id, producerId, label, sctpStreamParameters, protocol } =
      event.data;

    const consumer = await this.consumerTransport.current?.consumeData({
      id,
      dataProducerId: producerId,
      sctpStreamParameters,
      label,
      protocol,
    });

    if (!consumer) {
      console.error("Failed to create camera consumer!");
      return;
    }

    if (!this.remoteDataStreams.current[event.producerUsername]) {
      this.remoteDataStreams.current[event.producerUsername] = {};
    }
    if (
      !this.remoteDataStreams.current[event.producerUsername][
        event.producerInstance
      ]
    ) {
      this.remoteDataStreams.current[event.producerUsername][
        event.producerInstance
      ] = {};
    }

    const splitLabel = label.split("_");
    this.remoteDataStreams.current[event.producerUsername][
      event.producerInstance
    ][splitLabel[splitLabel.length - 1] as DataStreamTypes] = consumer;

    const message = {
      type: "newConsumerCreated",
      table_id: this.table_id.current,
      username: this.username.current,
      instance: this.instance.current,
      producerUsername: event.producerUsername,
      producerInstance: event.producerInstance,
      producerId: event.producerId,
      producerType: event.producerType,
    };
    this.socket.current.emit("message", message);
  }
}

export default ConsumersController;
