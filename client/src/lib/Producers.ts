import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "./CameraMedia";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import ScreenMedia from "./ScreenMedia";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import AudioMedia from "./AudioMedia";
import UserDevice from "../UserDevice";
import Deadbanding from "src/effects/visualEffects/lib/Deadbanding";
import BrowserMedia from "src/BrowserMedia";

class Producers {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
    };
    audio: { [effectType in AudioEffectTypes]: boolean };
  }>;
  private remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
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
  private setBundles: React.Dispatch<
    React.SetStateAction<{
      [username: string]: React.JSX.Element;
    }>
  >;
  private userDevice: UserDevice;
  private deadbanding: Deadbanding;
  private browserMedia: BrowserMedia;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        camera?: { [cameraId: string]: MediaStreamTrack };
        screen?: { [screenId: string]: MediaStreamTrack };
        audio?: MediaStreamTrack | undefined;
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
    createProducerBundle: () => void,
    setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: React.JSX.Element;
      }>
    >,
    userDevice: UserDevice,
    deadbanding: Deadbanding,
    browserMedia: BrowserMedia
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.userMedia = userMedia;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.remoteTracksMap = remoteTracksMap;
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
    this.setBundles = setBundles;
    this.userDevice = userDevice;
    this.deadbanding = deadbanding;
    this.browserMedia = browserMedia;
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

        let msg = {
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
          this.userMedia.current.camera[
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`
          ]
        ) {
          return;
        }

        const cameraBrowserMedia = await this.browserMedia.getCameraMedia();

        if (!cameraBrowserMedia) {
          this.producerTransport.current = undefined;
          this.userCameraCount.current = this.userCameraCount.current - 1;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        const newCameraMedia = new CameraMedia(
          this.username.current,
          this.table_id.current,
          `${this.username.current}_camera_stream_${this.userCameraCount.current}`,
          cameraBrowserMedia,
          this.currentEffectsStyles,
          this.userStreamEffects,
          this.userDevice,
          this.deadbanding
        );

        this.userMedia.current.camera[
          `${this.username.current}_camera_stream_${this.userCameraCount.current}`
        ] = newCameraMedia;

        const track =
          this.userMedia.current.camera[
            `${this.username.current}_camera_stream_${this.userCameraCount.current}`
          ].getTrack();
        const params = {
          track: track,
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
      }
      if (this.isScreen.current) {
        if (
          this.userMedia.current.screen[
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`
          ]
        ) {
          return;
        }

        const screenBrowserMedia = await this.browserMedia.getScreenMedia();

        if (!screenBrowserMedia) {
          this.producerTransport.current = undefined;
          this.userScreenCount.current = this.userScreenCount.current - 1;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        const newScreenMedia = new ScreenMedia(
          this.username.current,
          this.table_id.current,
          `${this.username.current}_screen_stream_${this.userScreenCount.current}`,
          screenBrowserMedia,
          this.currentEffectsStyles,
          this.userStreamEffects,
          this.userDevice
        );

        this.userMedia.current.screen[
          `${this.username.current}_screen_stream_${this.userScreenCount.current}`
        ] = newScreenMedia;

        const track =
          this.userMedia.current.screen[
            `${this.username.current}_screen_stream_${this.userScreenCount.current}`
          ].getTrack();
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
      }
      if (this.isAudio.current) {
        if (this.userMedia.current.audio) {
          console.error(
            "Already existing audio stream for: ",
            this.username.current
          );
          return;
        }

        const audioBrowserMedia = await this.browserMedia.getAudioMedia();

        if (!audioBrowserMedia) {
          this.producerTransport.current = undefined;
          const msg = {
            type: "deleteProducerTransport",
            table_id: this.table_id.current,
            username: this.username.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        const newAudioMedia = new AudioMedia(
          this.username.current,
          this.table_id.current,
          this.currentEffectsStyles,
          this.userStreamEffects,
          audioBrowserMedia
        );

        this.userMedia.current.audio = newAudioMedia;

        const audioTrack = this.userMedia.current.audio.getTrack();
        const audioParams = {
          track: audioTrack,
          appData: {
            producerType: "audio",
          },
        };
        await this.producerTransport.current?.produce(audioParams);
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
        this.userMedia.current.camera[
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

      const cameraBrowserMedia = await this.browserMedia.getCameraMedia();

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
        this.userStreamEffects,
        this.userDevice,
        this.deadbanding
      );

      this.userMedia.current.camera[
        `${this.username.current}_camera_stream_${this.userCameraCount.current}`
      ] = newCameraMedia;

      const track =
        this.userMedia.current.camera[
          `${this.username.current}_camera_stream_${this.userCameraCount.current}`
        ].getTrack();
      const params = {
        track: track,
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
        this.userMedia.current.screen[
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

      const screenBrowserMedia = await this.browserMedia.getScreenMedia();

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
        this.currentEffectsStyles,
        this.userStreamEffects,
        this.userDevice
      );

      this.userMedia.current.screen[
        `${this.username.current}_screen_stream_${this.userScreenCount.current}`
      ] = newScreenMedia;

      const track =
        this.userMedia.current.screen[
          `${this.username.current}_screen_stream_${this.userScreenCount.current}`
        ].getTrack();
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
      if (this.userMedia.current.audio) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error(
          "Already existing audio stream for: ",
          this.username.current
        );
        return;
      }

      const audioBrowserMedia = await this.browserMedia.getAudioMedia();

      if (!audioBrowserMedia) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error("Error getting audio data");
        return;
      }

      const newAudioMedia = new AudioMedia(
        this.username.current,
        this.table_id.current,
        this.currentEffectsStyles,
        this.userStreamEffects,
        audioBrowserMedia
      );

      this.userMedia.current.audio = newAudioMedia;

      const track = this.userMedia.current.audio.getTrack();
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

  onProducerDisconnected = (event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  }) => {
    if (event.producerUsername === this.username.current) {
      // Call deconstructors then delete userMedia
      if (event.producerType === "camera" || event.producerType === "screen") {
        this.userMedia.current[event.producerType][
          event.producerId
        ].deconstructor();
        delete this.userMedia.current[event.producerType][event.producerId];
      } else if (event.producerType === "audio") {
        this.userMedia.current[event.producerType]?.deconstructor();
        this.userMedia.current[event.producerType] = undefined;
      }

      // Delete old stream effects
      for (const effectType in this.userStreamEffects.current) {
        if (
          event.producerType === "camera" &&
          this.userStreamEffects.current[event.producerType][event.producerId][
            effectType as CameraEffectTypes
          ]
        ) {
          delete this.userStreamEffects.current[event.producerType][
            event.producerId
          ];
        } else if (
          event.producerType === "screen" &&
          this.userStreamEffects.current[event.producerType][event.producerId][
            effectType as ScreenEffectTypes
          ]
        ) {
          delete this.userStreamEffects.current[event.producerType][
            event.producerId
          ][effectType as ScreenEffectTypes];
        } else if (
          event.producerType === "audio" &&
          this.userStreamEffects.current[event.producerType][
            effectType as AudioEffectTypes
          ]
        ) {
          delete this.userStreamEffects.current[event.producerType][
            effectType as AudioEffectTypes
          ];
        }
      }

      // Clean up bundles and producer transport if necessary
      if (
        (!this.userMedia.current.camera ||
          Object.keys(this.userMedia.current.camera).length === 0) &&
        (!this.userMedia.current.screen ||
          Object.keys(this.userMedia.current.screen).length === 0) &&
        !this.userMedia.current.audio
      ) {
        this.setBundles((prev) => {
          const newBundles = prev;
          if (newBundles) {
            delete newBundles[event.producerUsername];
          }
          return newBundles;
        });
        this.producerTransport.current = undefined;
      }

      // Clean up camera and screen states
      if (Object.keys(this.userMedia.current.camera).length === 0) {
        this.isCamera.current = false;
        this.setCameraActive(false);
      } else {
        this.isCamera.current = true;
        this.setCameraActive(true);
      }
      if (Object.keys(this.userMedia.current.screen).length === 0) {
        this.isScreen.current = false;
        this.setScreenActive(false);
      } else {
        this.isScreen.current = true;
        this.setScreenActive(true);
      }

      // Re-enable button
      this.handleDisableEnableBtns(false);
    } else {
      // Delete remote tracks
      if (event.producerType === "camera" || event.producerType === "screen") {
        delete this.remoteTracksMap.current[event.producerUsername]?.[
          event.producerType
        ]?.[event.producerId];

        if (
          this.remoteTracksMap.current[event.producerUsername] &&
          Object.keys(
            this.remoteTracksMap.current[event.producerUsername][
              event.producerType
            ] || {}
          ).length === 0
        ) {
          delete this.remoteTracksMap.current[event.producerUsername]?.[
            event.producerType
          ];

          if (
            this.remoteTracksMap.current[event.producerUsername] &&
            Object.keys(this.remoteTracksMap.current[event.producerUsername])
              .length === 0
          ) {
            delete this.remoteTracksMap.current[event.producerUsername];
          }
        }
      } else if (event.producerType === "audio") {
        delete this.remoteTracksMap.current[event.producerUsername]?.[
          event.producerType
        ];

        if (
          this.remoteTracksMap.current[event.producerUsername] &&
          Object.keys(this.remoteTracksMap.current[event.producerUsername])
            .length === 0
        ) {
          delete this.remoteTracksMap.current[event.producerUsername];
        }
      }

      // Clean up bundles
      if (!this.remoteTracksMap.current[event.producerUsername]) {
        this.setBundles((prev) => {
          const newBundles = prev;
          if (newBundles) {
            delete newBundles[event.producerUsername];
          }
          return newBundles;
        });
      }
    }
  };
}
export default Producers;
