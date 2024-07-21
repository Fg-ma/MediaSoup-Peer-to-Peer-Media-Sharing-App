import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import getBrowserMedia from "../getBrowserMedia";
import CameraMedia from "./CameraMedia";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import ScreenMedia from "./ScreenMedia";
import { EffectTypes } from "../context/StreamsContext";

class Producers {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: string | undefined;
  }>;
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      camera?:
        | {
            [cameraId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;
  private userCameraCount: React.MutableRefObject<number>;
  private userScreenCount: React.MutableRefObject<number>;
  private isCamera: React.MutableRefObject<boolean>;
  private isScreen: React.MutableRefObject<boolean>;
  private isAudio: React.MutableRefObject<boolean>;
  private isSubscribed: React.MutableRefObject<boolean>;
  private handleDisableEnableBtns: (disabled: boolean) => void;
  private producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
  private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  private createProducerBundle: () => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    userStreams: React.MutableRefObject<{
      camera: {
        [cameraId: string]: MediaStream;
      };
      screen: {
        [screenId: string]: MediaStream;
      };
      audio: MediaStream | undefined;
    }>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: string | undefined;
    }>,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      [effectType in EffectTypes]: {
        camera?:
          | {
              [cameraId: string]: boolean;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: boolean;
            }
          | undefined;
        audio?: boolean;
      };
    }>,
    userCameraCount: React.MutableRefObject<number>,
    userScreenCount: React.MutableRefObject<number>,
    isCamera: React.MutableRefObject<boolean>,
    isScreen: React.MutableRefObject<boolean>,
    isAudio: React.MutableRefObject<boolean>,
    isSubscribed: React.MutableRefObject<boolean>,
    handleDisableEnableBtns: (disabled: boolean) => void,
    producerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,
    setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    createProducerBundle: () => void
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.userStreams = userStreams;
    this.userMedia = userMedia;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.userCameraCount = userCameraCount;
    this.userScreenCount = userScreenCount;
    this.isCamera = isCamera;
    this.isScreen = isScreen;
    this.isAudio = isAudio;
    this.isSubscribed = isSubscribed;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
    this.producerTransport = producerTransport;
    this.setScreenActive = setScreenActive;
    this.setCameraActive = setCameraActive;
    this.createProducerBundle = createProducerBundle;
  }

  async onProducerTransportCreated(event: {
    type: string;
    params: {
      id: string;
      iceParameters: mediasoup.types.IceParameters;
      iceCandidates: mediasoup.types.IceCandidate[];
      dtlsParameters: mediasoup.types.DtlsParameters;
    };
    error?: unknown;
  }) {
    if (event.error) {
      console.error("Producer transport create error: ", event.error);
      return;
    }

    if (!this.device.current) {
      console.error("No device found");
      return;
    }

    this.producerTransport.current = this.device.current.createSendTransport(
      event.params
    );
    this.producerTransport.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        const msg = {
          type: "connectProducerTransport",
          dtlsParameters,
          table_id: this.table_id.current,
          username: this.username.current,
        };

        this.socket.current.send(msg);
        this.socket.current.on("message", (event) => {
          if (event.type === "producerConnected") {
            callback();
          }
        });
      }
    );

    // Begin transport on producer
    this.producerTransport.current.on(
      "produce",
      async (params, callback, errback) => {
        const { kind, rtpParameters, appData } = params;

        let msg;
        if (
          appData.producerDirection &&
          appData.producerDirection === "swap" &&
          this.device.current
        ) {
          msg = {
            type: "swapProducer",
            producerType: appData.producerType,
            transportId: this.producerTransport.current?.id,
            kind,
            rtpParameters,
            table_id: this.table_id.current,
            username: this.username.current,
            producerId: appData.producerId,
          };
        } else {
          msg = {
            type: "createNewProducer",
            producerType: appData.producerType,
            transportId: this.producerTransport.current?.id,
            kind,
            rtpParameters,
            table_id: this.table_id.current,
            username: this.username.current,
            producerId:
              appData.producerType === "camera"
                ? `${this.username.current}_camera_stream_${this.userCameraCount.current}`
                : appData.producerType === "screen"
                ? `${this.username.current}_screen_stream_${this.userScreenCount.current}`
                : undefined,
          };
        }

        this.socket.current.emit("message", msg);

        this.socket.current.once(
          "newProducerCallback",
          (res: { id: string }) => {
            callback(res);
          }
        );
        return;
      }
    );
    // end transport producer

    // connection state change begin
    this.producerTransport.current.on("connectionstatechange", (state) => {
      switch (state) {
        case "connecting":
          break;
        case "connected":
          this.createProducerBundle();
          this.handleDisableEnableBtns(false);
          break;
        case "failed":
          this.producerTransport.current?.close();
          break;
        default:
          break;
      }
    });
    // connection state change end

    try {
      if (this.isCamera.current) {
        if (
          this.userStreams.current.camera[
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`
          ]
        ) {
          return;
        }

        const cameraBrowserMedia = await getBrowserMedia(
          "camera",
          this.device,
          this.handleDisableEnableBtns,
          this.isScreen,
          this.setScreenActive,
          this.isCamera,
          this.setCameraActive,
          this.userStreams
        );

        if (cameraBrowserMedia) {
          const newCameraMedia = new CameraMedia(
            this.username.current,
            this.table_id.current,
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`,
            cameraBrowserMedia,
            this.currentEffectsStyles,
            this.userStreamEffects
          );

          this.userMedia.current.camera[
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`
          ] = newCameraMedia;

          this.userStreams.current.camera[
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`
          ] = cameraBrowserMedia;

          const params = {
            track: newCameraMedia.getTrack(),
            appData: {
              producerType: "camera",
            },
          };

          try {
            await this.producerTransport.current?.produce(params);
          } catch {
            console.error("Camera new transport failed to produce");
            return;
          }
        } else {
          this.producerTransport.current = undefined;
          this.userCameraCount.current = this.userCameraCount.current - 1;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
        }
      }
      if (this.isScreen.current) {
        if (
          this.userStreams.current.screen[
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`
          ]
        ) {
          return;
        }

        const screenBrowserMedia = await getBrowserMedia(
          "screen",
          this.device,
          this.handleDisableEnableBtns,
          this.isScreen,
          this.setScreenActive,
          this.isCamera,
          this.setCameraActive,
          this.userStreams
        );

        if (screenBrowserMedia) {
          const newScreenMedia = new ScreenMedia(
            this.username.current,
            this.table_id.current,
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`,
            screenBrowserMedia,
            this.currentEffectsStyles
          );

          this.userMedia.current.screen[
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`
          ] = newScreenMedia;

          this.userStreams.current.screen[
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`
          ] = screenBrowserMedia;

          const track =
            this.userStreams.current.screen[
              `${this.username.current}_screen_stream_${this.userScreenCount.current}`
            ].getVideoTracks()[0];
          const params = {
            track: track,
            appData: {
              producerType: "screen",
            },
          };

          try {
            await this.producerTransport.current?.produce(params);
          } catch {
            console.error("Screen new transport failed to produce");
            return;
          }
        } else {
          this.producerTransport.current = undefined;
          this.userScreenCount.current = this.userScreenCount.current - 1;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
        }
      }
      if (this.isAudio.current) {
        if (this.userStreams.current.audio) {
          console.error(
            "Already existing audio stream for: ",
            this.username.current
          );
          return;
        }

        this.userStreams.current.audio = await getBrowserMedia(
          "audio",
          this.device,
          this.handleDisableEnableBtns,
          this.isScreen,
          this.setScreenActive,
          this.isCamera,
          this.setCameraActive,
          this.userStreams
        );

        if (this.userStreams.current.audio) {
          const audioTrack = this.userStreams.current.audio.getAudioTracks()[0];
          const audioParams = {
            track: audioTrack,
            appData: {
              producerType: "audio",
            },
          };
          await this.producerTransport.current?.produce(audioParams);
        } else {
          this.producerTransport.current = undefined;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async onNewProducer(event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
  }) {
    let producerId: string | undefined;
    if (event.producerType === "camera") {
      producerId = `${this.username.current}_camera_stream_${this.userCameraCount.current}`;
      if (
        this.userStreams.current.camera[
          `${this.username.current}_camera_stream_${this.userCameraCount.current}`
        ]
      ) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error(
          "Already existing camera stream for: ",
          this.username.current
        );
        return;
      }

      const cameraBrowserMedia = await getBrowserMedia(
        event.producerType,
        this.device,
        this.handleDisableEnableBtns,
        this.isScreen,
        this.setScreenActive,
        this.isCamera,
        this.setCameraActive,
        this.userStreams
      );

      if (!cameraBrowserMedia) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error("Error getting camera data");
        return;
      }

      const newCameraMedia = new CameraMedia(
        this.username.current,
        this.table_id.current,
        `${this.username.current}_camera_stream_${this.userCameraCount.current}`,
        cameraBrowserMedia,
        this.currentEffectsStyles,
        this.userStreamEffects
      );

      this.userMedia.current.camera[
        `${this.username.current}_camera_stream_${this.userCameraCount.current}`
      ] = newCameraMedia;

      this.userStreams.current.camera[
        `${this.username.current}_camera_stream_${this.userCameraCount.current}`
      ] = cameraBrowserMedia;

      const params = {
        track: newCameraMedia.getTrack(),
        appData: {
          producerType: "camera",
        },
      };

      try {
        await this.producerTransport.current?.produce(params);
      } catch {
        console.error("Camera new transport failed to produce");
        return;
      }
    } else if (event.producerType === "screen") {
      producerId = `${this.username.current}_screen_stream_${this.userCameraCount.current}`;
      if (
        this.userStreams.current.screen[
          `${this.username.current}_screen_stream_${this.userScreenCount.current}`
        ]
      ) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error(
          "Already existing screen stream for: ",
          this.username.current
        );
        return;
      }

      const screenBrowserMedia = await getBrowserMedia(
        event.producerType,
        this.device,
        this.handleDisableEnableBtns,
        this.isScreen,
        this.setScreenActive,
        this.isCamera,
        this.setCameraActive,
        this.userStreams
      );

      if (!screenBrowserMedia) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error("Error getting screen data");
        return;
      }

      const newScreenMedia = new ScreenMedia(
        this.username.current,
        this.table_id.current,
        `${this.username.current}_screen_stream_${this.userScreenCount.current}`,
        screenBrowserMedia,
        this.currentEffectsStyles
      );

      this.userMedia.current.screen[
        `${this.username.current}_screen_stream_${this.userScreenCount.current}`
      ] = newScreenMedia;

      this.userStreams.current.screen[
        `${this.username.current}_screen_stream_${this.userScreenCount.current}`
      ] = screenBrowserMedia;

      const track =
        this.userStreams.current.screen[
          `${this.username.current}_screen_stream_${this.userScreenCount.current}`
        ].getVideoTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "screen",
        },
      };

      try {
        await this.producerTransport.current?.produce(params);
      } catch {
        console.error("Screen new transport failed to produce");
        return;
      }
    } else if (event.producerType === "audio") {
      if (this.userStreams.current.audio) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error(
          "Already existing audio stream for: ",
          this.username.current
        );
        return;
      }

      this.userStreams.current.audio = await getBrowserMedia(
        event.producerType,
        this.device,
        this.handleDisableEnableBtns,
        this.isScreen,
        this.setScreenActive,
        this.isCamera,
        this.setCameraActive,
        this.userStreams
      );

      if (!this.userStreams.current.audio) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error("Error getting audio data");
        return;
      }

      const track = this.userStreams.current.audio.getAudioTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "audio",
        },
      };

      try {
        await this.producerTransport.current?.produce(params);
      } catch {
        console.error("Audio new transport failed to produce");
        return;
      }
    }

    // Reenable buttons
    this.handleDisableEnableBtns(false);

    const msg = {
      type: "newProducerCreated",
      username: this.username.current,
      table_id: this.table_id.current,
      producerType: event.producerType,
      producerId: producerId,
    };

    this.socket.current.emit("message", msg);
  }

  onNewProducerAvailable(event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId?: string;
  }) {
    if (
      event.producerUsername !== this.username.current &&
      this.isSubscribed.current &&
      this.device.current
    ) {
      const { rtpCapabilities } = this.device.current;

      const msg = {
        type: "newConsumer",
        consumerType: event.producerType,
        rtpCapabilities: rtpCapabilities,
        producerUsername: event.producerUsername,
        table_id: this.table_id.current,
        username: this.username.current,
        incomingProducerId: event.producerId,
      };
      this.socket.current.emit("message", msg);
    }
  }

  onSwapedProducer = async (event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  }) => {
    if (
      event.producerUsername === this.username.current ||
      !this.isSubscribed.current ||
      !this.device.current
    ) {
      return;
    }

    const { rtpCapabilities } = this.device.current;

    const msg = {
      type: "swapConsumer",
      consumerType: event.producerType,
      swappingProducerId: event.producerId,
      swappingUsername: event.producerUsername,
      table_id: this.table_id.current,
      username: this.username.current,
      rtpCapabilities: rtpCapabilities,
    };
    this.socket.current.emit("message", msg);
  };
}
export default Producers;
