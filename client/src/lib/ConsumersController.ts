import React from "react";
import { types } from "mediasoup-client";
import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import {
  DataStreamTypes,
  RemoteDataStreamsType,
  RemoteMediaType,
} from "../context/mediaContext/typeConstant";
import MediasoupSocketController from "../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  IncomingMediasoupMessages,
  onConsumerTransportCreatedType,
  onNewConsumerSubscribedType,
  onNewJSONConsumerSubscribedType,
  onSubscribedType,
} from "../serverControllers/mediasoupServer/lib/typeConstant";

class ConsumersController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private device: React.MutableRefObject<types.Device | undefined>,

    private tableId: React.MutableRefObject<string>,
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
      screenAudioIds: (string | undefined)[],
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
      remoteAudioStream: MediaStream | undefined,
    ) => void,
  ) {}

  async onSubscribed(event: onSubscribedType) {
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

  async onConsumerTransportCreated(event: onConsumerTransportCreatedType) {
    if (event.error) {
      console.error("On consumer transport create error: ", event.error);
    }

    const { params } = event.data;

    if (!this.device.current) {
      console.error("No device found");
      return;
    }

    this.consumerTransport.current =
      this.device.current.createRecvTransport(params);

    this.consumerTransport.current.on(
      "connect",
      ({ dtlsParameters }, callback, _errback) => {
        this.mediasoupSocket.current?.sendMessage({
          type: "connectConsumerTransport",
          header: {
            tableId: this.tableId.current,
            username: this.username.current,
            instance: this.instance.current,
          },
          data: {
            transportId: this.consumerTransport.current?.id ?? "",
            dtlsParameters,
          },
        });
        const consumerTransportConnectedCallback = (
          event: IncomingMediasoupMessages,
        ) => {
          if (event.type === "consumerTransportConnected") {
            callback();
            this.mediasoupSocket.current?.removeMessageListener(
              consumerTransportConnectedCallback,
            );
          }
        };
        this.mediasoupSocket.current?.addMessageListener(
          consumerTransportConnectedCallback,
        );
      },
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
                    this.remoteMedia.current[username][instance].camera![key],
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
                    this.remoteMedia.current[username][instance].screen![key],
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
                    ],
                  );
                  remoteScreenAudioStreams[key] = remoteScreenAudioStream;
                }

                let remoteAudioStream: MediaStream | undefined = undefined;
                if (this.remoteMedia.current[username][instance].audio) {
                  remoteAudioStream = new MediaStream();
                  remoteAudioStream.addTrack(
                    this.remoteMedia.current[username][instance].audio!,
                  );
                }

                this.createConsumerBundle(
                  username,
                  instance,
                  remoteCameraStreams,
                  remoteScreenStreams,
                  remoteScreenAudioStreams,
                  remoteAudioStream,
                );
              }
            }

            this.mediasoupSocket.current?.sendMessage({
              type: "resume",
              header: {
                tableId: this.tableId.current,
                username: this.username.current,
                instance: this.instance.current,
              },
            });
            break;
          }
          case "failed": {
            this.consumerTransport.current?.close();
            break;
          }
          default:
            break;
        }
      },
    );

    const { rtpCapabilities } = this.device.current;

    this.mediasoupSocket.current?.sendMessage({
      type: "consume",
      header: {
        tableId: this.tableId.current,
        username: this.username.current,
        instance: this.instance.current,
      },
      data: {
        rtpCapabilities,
      },
    });
  }

  async onNewConsumerSubscribed(event: onNewConsumerSubscribedType) {
    const { producerUsername, producerInstance, producerType, producerId } =
      event.header;

    if (producerInstance === this.instance.current) {
      return;
    }

    const { id, kind, rtpParameters } = event.data;
    const consumer = await this.consumerTransport.current?.consume({
      id,
      producerId: event.data.producerId,
      kind,
      rtpParameters,
    });

    if (!consumer) {
      console.error("Failed to create camera consumer!");
      return;
    }

    if (!this.remoteMedia.current[producerUsername]) {
      this.remoteMedia.current[producerUsername] = {};
    }
    if (!this.remoteMedia.current[producerUsername][producerInstance]) {
      this.remoteMedia.current[producerUsername][producerInstance] = {};
    }
    if (
      producerType === "camera" ||
      producerType === "screen" ||
      producerType === "screenAudio"
    ) {
      if (
        !this.remoteMedia.current[producerUsername][producerInstance][
          producerType
        ]
      ) {
        this.remoteMedia.current[producerUsername][producerInstance][
          producerType
        ] = {};
      }

      if (producerId) {
        this.remoteMedia.current[producerUsername][producerInstance][
          producerType
        ]![producerId] = consumer.track;
      }
    } else {
      this.remoteMedia.current[producerUsername][producerInstance].audio =
        consumer.track;
    }

    this.setUpEffectContext(
      producerUsername,
      producerInstance,
      producerType === "camera" ? [producerId] : [],
      producerType === "screen" ? [producerId] : [],
      producerType === "screenAudio" ? [producerId] : [],
    );

    if (
      Object.keys(
        this.remoteMedia.current[producerUsername][producerInstance] || {},
      ).length === 1 &&
      (Object.keys(
        this.remoteMedia.current[producerUsername][producerInstance].camera ||
          {},
      ).length === 1 ||
        Object.keys(
          this.remoteMedia.current[producerUsername][producerInstance].screen ||
            {},
        ).length === 1 ||
        Object.keys(
          this.remoteMedia.current[producerUsername][producerInstance]
            .screenAudio || {},
        ).length === 1 ||
        this.remoteMedia.current[producerUsername][producerInstance].audio)
    ) {
      const remoteCameraStreams: { [cameraId: string]: MediaStream } = {};
      if (
        this.remoteMedia.current[producerUsername][producerInstance]?.camera
      ) {
        for (const key in this.remoteMedia.current[producerUsername][
          producerInstance
        ].camera) {
          const remoteCameraStream = new MediaStream();
          remoteCameraStream.addTrack(
            this.remoteMedia.current[producerUsername][producerInstance]
              .camera![key],
          );
          remoteCameraStreams[key] = remoteCameraStream;
        }
      }

      const remoteScreenStreams: { [screenId: string]: MediaStream } = {};
      if (
        this.remoteMedia.current[producerUsername][producerInstance]?.screen
      ) {
        for (const key in this.remoteMedia.current[producerUsername][
          producerInstance
        ].screen) {
          const remoteScreenStream = new MediaStream();
          remoteScreenStream.addTrack(
            this.remoteMedia.current[producerUsername][producerInstance]
              .screen![key],
          );
          remoteScreenStreams[key] = remoteScreenStream;
        }
      }

      const remoteScreenAudioStreams: { [screenAudioId: string]: MediaStream } =
        {};
      if (
        this.remoteMedia.current[producerUsername][producerInstance]
          ?.screenAudio
      ) {
        for (const key in this.remoteMedia.current[producerUsername][
          producerInstance
        ].screenAudio) {
          const remoteScreenAudioStream = new MediaStream();
          remoteScreenAudioStream.addTrack(
            this.remoteMedia.current[producerUsername][producerInstance]
              .screenAudio![key],
          );
          remoteScreenAudioStreams[key] = remoteScreenAudioStream;
        }
      }

      let remoteAudioStream: MediaStream | undefined = undefined;
      if (
        this.remoteMedia.current[producerUsername][producerInstance] &&
        this.remoteMedia.current[producerUsername][producerInstance].audio
      ) {
        remoteAudioStream = new MediaStream();
        remoteAudioStream.addTrack(
          this.remoteMedia.current[producerUsername][producerInstance].audio!,
        );
      }

      this.createConsumerBundle(
        producerUsername,
        producerInstance,
        remoteCameraStreams,
        remoteScreenStreams,
        remoteScreenAudioStreams,
        remoteAudioStream,
      );
    }

    this.mediasoupSocket.current?.sendMessage({
      type: "resume",
      header: {
        tableId: this.tableId.current,
        username: this.username.current,
        instance: this.instance.current,
      },
    });

    this.mediasoupSocket.current?.sendMessage({
      type: "newConsumerCreated",
      header: {
        tableId: this.tableId.current,
        username: this.username.current,
        instance: this.instance.current,
      },
      data: {
        producerUsername,
        producerInstance,
        producerId,
        producerType,
      },
    });
  }

  async onNewJSONConsumerSubscribed(event: onNewJSONConsumerSubscribedType) {
    const { producerUsername, producerInstance, producerType, producerId } =
      event.header;

    if (producerInstance === this.instance.current) {
      return;
    }

    const { id, label, sctpStreamParameters, protocol } = event.data;

    const consumer = await this.consumerTransport.current?.consumeData({
      id,
      dataProducerId: event.data.producerId,
      sctpStreamParameters,
      label,
      protocol,
    });

    if (!consumer) {
      console.error("Failed to create camera consumer!");
      return;
    }

    if (!this.remoteDataStreams.current[producerUsername]) {
      this.remoteDataStreams.current[producerUsername] = {};
    }
    if (!this.remoteDataStreams.current[producerUsername][producerInstance]) {
      this.remoteDataStreams.current[producerUsername][producerInstance] = {};
    }

    const splitLabel = label.split("_");
    this.remoteDataStreams.current[producerUsername][producerInstance][
      splitLabel[splitLabel.length - 1] as DataStreamTypes
    ] = consumer;

    this.mediasoupSocket.current?.sendMessage({
      type: "newConsumerCreated",
      header: {
        tableId: this.tableId.current,
        username: this.username.current,
        instance: this.instance.current,
      },
      data: {
        producerUsername,
        producerInstance,
        producerId,
        producerType,
      },
    });
  }
}

export default ConsumersController;
