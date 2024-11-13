import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import { UserMedia } from "tone";
import {
  defaultAudioCurrentEffectsStyles,
  EffectStylesType,
} from "../context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  DataStreamTypes,
  defaultAudioStreamEffects,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";
import UserDevice from "../UserDevice";
import BrowserMedia from "../BrowserMedia";
import Deadbanding from "../babylon/Deadbanding";

class Producers {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<mediasoup.types.Device | undefined>,

    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera?: { [cameraId: string]: MediaStreamTrack };
          screen?: { [screenId: string]: MediaStreamTrack };
          audio?: MediaStreamTrack | undefined;
        };
      };
    }>,
    private userDataStreams: React.MutableRefObject<{
      positionScaleRotation?: mediasoup.types.DataProducer;
    }>,

    private userCameraCount: React.MutableRefObject<number>,
    private userScreenCount: React.MutableRefObject<number>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isAudio: React.MutableRefObject<boolean>,
    private isSubscribed: React.MutableRefObject<boolean>,

    private handleDisableEnableBtns: (disabled: boolean) => void,
    private producerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private createProducerBundle: () => void,
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,

    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private browserMedia: BrowserMedia
  ) {}

  private createCameraProducer = async (cameraBrowserMedia: MediaStream) => {
    const cameraId = `${this.username.current}_camera_stream_${this.userCameraCount.current}`;
    const newCameraMedia = new CameraMedia(
      this.username.current,
      this.table_id.current,
      cameraId,
      cameraBrowserMedia,
      this.currentEffectsStyles,
      this.userStreamEffects,
      this.userDevice,
      this.deadbanding,
      this.userMedia
    );

    this.userMedia.current.camera[cameraId] = newCameraMedia;

    const track = this.userMedia.current.camera[cameraId].getTrack();
    const params = {
      track: track,
      appData: {
        producerType: "camera",
        producerId: cameraId,
      },
    };

    try {
      await this.producerTransport.current?.produce(params);
    } catch {
      console.error("Camera new transport failed to produce");
      return;
    }
  };

  private createScreenProducer = async (screenBrowserMedia: MediaStream) => {
    const screenId = `${this.username.current}_screen_stream_${this.userScreenCount.current}`;
    const newScreenMedia = new ScreenMedia(
      this.username.current,
      this.table_id.current,
      screenId,
      screenBrowserMedia,
      this.currentEffectsStyles,
      this.userStreamEffects,
      this.userDevice,
      this.userMedia
    );

    this.userMedia.current.screen[screenId] = newScreenMedia;

    const track = this.userMedia.current.screen[screenId].getTrack();
    const params = {
      track: track,
      appData: {
        producerType: "screen",
        producerId: screenId,
      },
    };

    try {
      await this.producerTransport.current?.produce(params);
    } catch {
      console.error("Screen new transport failed to produce");
      return;
    }
  };

  private createAudioProducer = async (audioBrowserMedia: UserMedia) => {
    const newAudioMedia = new AudioMedia(
      this.username.current,
      this.table_id.current,
      this.userStreamEffects,
      audioBrowserMedia
    );
    await newAudioMedia.openMic();

    this.userMedia.current.audio = newAudioMedia;

    const audioTracks = this.userMedia.current.audio.getMasterTrack();
    const audioParams = {
      track: audioTracks,
      appData: {
        producerType: "audio",
      },
    };

    await this.producerTransport.current?.produce(audioParams);
  };

  private createJSONProducer = async (dataStreamType: DataStreamTypes) => {
    if (!this.producerTransport.current) {
      console.error("No transport available to create JSON data producer");
      return;
    }

    const jsonId = `${this.username.current}_${dataStreamType}_data_stream`;
    const label = `${this.username.current}_${dataStreamType}`;

    // Create a data producer for JSON data on the transport
    const jsonDataProducer = await this.producerTransport.current.produceData({
      label: label,
      protocol: "json",
      appData: {
        producerType: "json",
        producerId: jsonId,
        dataStreamType: dataStreamType,
      },
    });

    this.userDataStreams.current[dataStreamType] = jsonDataProducer;
  };

  onProducerTransportCreated = async (event: {
    type: string;
    params: {
      id: string;
      iceParameters: mediasoup.types.IceParameters;
      iceCandidates: mediasoup.types.IceCandidate[];
      dtlsParameters: mediasoup.types.DtlsParameters;
    };
    error?: unknown;
  }) => {
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
      async ({ dtlsParameters }, callback, _errback) => {
        const msg = {
          type: "connectProducerTransport",
          dtlsParameters,
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
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
      async (params, callback, _errback) => {
        const { kind, rtpParameters, appData } = params;

        const msg = {
          type: "createNewProducer",
          producerType: appData.producerType,
          transportId: this.producerTransport.current?.id,
          kind,
          rtpParameters,
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerId: appData.producerId,
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

    this.producerTransport.current.on(
      "producedata",
      async (params, callback, _errback) => {
        // Create the producer based on params
        const { label, protocol, sctpStreamParameters, appData } = params;

        const msg = {
          type: "createNewJSONProducer",
          producerType: appData.producerType,
          transportId: this.producerTransport.current?.id,
          label,
          protocol,
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerId: appData.producerId,
          sctpStreamParameters,
          dataStreamType: appData.dataStreamType,
        };

        this.socket.current.emit("message", msg);

        this.socket.current.once(
          "newJSONProducerCallback",
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
            instance: this.instance.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        await this.createCameraProducer(cameraBrowserMedia);

        if (this.userDataStreams.current.positionScaleRotation === undefined) {
          await this.createJSONProducer("positionScaleRotation");
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
            instance: this.instance.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        await this.createScreenProducer(screenBrowserMedia);

        if (this.userDataStreams.current.positionScaleRotation === undefined) {
          await this.createJSONProducer("positionScaleRotation");
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
            instance: this.instance.current,
          };
          this.socket.current.emit("message", msg);
          return;
        }

        await this.createAudioProducer(audioBrowserMedia);

        if (this.userDataStreams.current.positionScaleRotation === undefined) {
          await this.createJSONProducer("positionScaleRotation");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  createNewProducer = async (producerType: "camera" | "screen" | "audio") => {
    let producerId: string | undefined;
    if (producerType === "camera") {
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

      await this.createCameraProducer(cameraBrowserMedia);

      if (this.userDataStreams.current.positionScaleRotation === undefined) {
        await this.createJSONProducer("positionScaleRotation");
      }
    } else if (producerType === "screen") {
      producerId = `${this.username.current}_screen_stream_${this.userScreenCount.current}`;
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

      await this.createScreenProducer(screenBrowserMedia);

      if (this.userDataStreams.current.positionScaleRotation === undefined) {
        await this.createJSONProducer("positionScaleRotation");
      }
    } else if (producerType === "audio") {
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

      await this.createAudioProducer(audioBrowserMedia);

      if (this.userDataStreams.current.positionScaleRotation === undefined) {
        await this.createJSONProducer("positionScaleRotation");
      }
    }

    // Reenable buttons
    this.handleDisableEnableBtns(false);

    const msg = {
      type: "newProducerCreated",
      table_id: this.table_id.current,
      username: this.username.current,
      instance: this.instance.current,
      producerType: producerType,
      producerId: producerId,
    };

    this.socket.current.emit("message", msg);
  };

  onNewProducerAvailable = (event: {
    type: "newProducerAvailable";
    producerUsername: string;
    producerInstance: string;
    producerType: string;
    producerId?: string;
  }) => {
    if (
      event.producerInstance !== this.instance.current &&
      this.isSubscribed.current &&
      this.device.current
    ) {
      const { rtpCapabilities } = this.device.current;

      const msg = {
        type: "newConsumer",
        consumerType: event.producerType,
        rtpCapabilities: rtpCapabilities,
        producerUsername: event.producerUsername,
        producerInstance: event.producerInstance,
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        incomingProducerId: event.producerId,
      };
      this.socket.current.emit("message", msg);
    }
  };

  onNewJSONProducerAvailable = (event: {
    type: "newJSONProducerAvailable";
    producerUsername: string;
    producerInstance: string;
    producerType: string;
    producerId: string;
    dataStreamType: DataStreamTypes;
  }) => {
    if (
      event.producerInstance !== this.instance.current &&
      this.isSubscribed.current &&
      this.device.current
    ) {
      const { sctpCapabilities } = this.device.current;

      const msg = {
        type: "newJSONConsumer",
        consumerType: event.producerType,
        sctpCapabilities: sctpCapabilities,
        producerUsername: event.producerUsername,
        producerInstance: event.producerInstance,
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        incomingProducerId: event.producerId,
        dataStreamType: event.dataStreamType,
      };
      this.socket.current.emit("message", msg);
    }
  };

  onProducerDisconnected = (event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string;
  }) => {
    if (
      event.producerUsername === this.username.current &&
      event.producerInstance === this.instance.current
    ) {
      // Call deconstructors then delete userMedia
      if (event.producerType === "camera" || event.producerType === "screen") {
        if (this.userMedia.current[event.producerType][event.producerId]) {
          this.userMedia.current[event.producerType][
            event.producerId
          ].deconstructor();
          delete this.userMedia.current[event.producerType][event.producerId];
        }
      } else if (event.producerType === "audio") {
        if (this.userMedia.current[event.producerType]) {
          this.userMedia.current[event.producerType]?.deconstructor();
          this.userMedia.current[event.producerType] = undefined;
        }
      }

      // Delete old stream effects
      const streamEffects = this.userStreamEffects.current[event.producerType];

      if (streamEffects) {
        if (event.producerType === "audio") {
          this.userStreamEffects.current.audio = structuredClone(
            defaultAudioStreamEffects
          );
        } else if (
          event.producerType === "camera" ||
          event.producerType === "screen"
        ) {
          if (event.producerId && event.producerId in streamEffects) {
            delete this.userStreamEffects.current[event.producerType][
              event.producerId as keyof typeof streamEffects
            ];
          }
        }
      }

      // Delete old effects styles
      if (this.currentEffectsStyles.current[event.producerType]) {
        if (event.producerType === "audio") {
          this.currentEffectsStyles.current.audio = structuredClone(
            defaultAudioCurrentEffectsStyles
          );
        } else if (
          event.producerType === "camera" ||
          event.producerType === "screen"
        ) {
          if (
            event.producerId &&
            event.producerId in
              this.currentEffectsStyles.current[event.producerType]
          ) {
            delete this.currentEffectsStyles.current[event.producerType][
              event.producerId
            ];
          }
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
          const newBundles = { ...prev };

          if (
            newBundles[event.producerUsername] &&
            newBundles[event.producerUsername][event.producerInstance]
          ) {
            delete newBundles[event.producerUsername][event.producerInstance];

            if (Object.keys(newBundles[event.producerUsername]).length === 0) {
              delete newBundles[event.producerUsername];
            }
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
        if (
          this.remoteTracksMap.current[event.producerUsername] &&
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ] &&
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ][event.producerType] &&
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ][event.producerType]![event.producerId]
        ) {
          delete this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ]?.[event.producerType]?.[event.producerId];

          if (
            Object.keys(
              this.remoteTracksMap.current[event.producerUsername][
                event.producerInstance
              ][event.producerType] || { break: true }
            ).length === 0
          ) {
            delete this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ]?.[event.producerType];

            if (
              Object.keys(
                this.remoteTracksMap.current[event.producerUsername][
                  event.producerInstance
                ] || { break: true }
              ).length === 0
            ) {
              delete this.remoteTracksMap.current[event.producerUsername][
                event.producerInstance
              ];

              if (
                Object.keys(
                  this.remoteTracksMap.current[event.producerUsername] || {
                    break: true,
                  }
                ).length === 0
              ) {
                delete this.remoteTracksMap.current[event.producerUsername];
              }
            }
          }
        }
      } else if (event.producerType === "audio") {
        if (
          this.remoteTracksMap.current[event.producerUsername] &&
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ] &&
          this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ][event.producerType]
        ) {
          delete this.remoteTracksMap.current[event.producerUsername][
            event.producerInstance
          ][event.producerType];

          if (
            Object.keys(
              this.remoteTracksMap.current[event.producerUsername][
                event.producerInstance
              ] || { break: true }
            ).length === 0
          ) {
            delete this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ];

            if (
              Object.keys(
                this.remoteTracksMap.current[event.producerUsername] || {
                  break: true,
                }
              ).length === 0
            ) {
              delete this.remoteTracksMap.current[event.producerUsername];
            }
          }
        }
      }

      // Clean up bundles
      if (
        !this.remoteTracksMap.current[event.producerUsername] ||
        !this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ]
      ) {
        this.setBundles((prev) => {
          const newBundles = { ...prev };

          if (
            newBundles[event.producerUsername] &&
            newBundles[event.producerUsername][event.producerInstance]
          ) {
            delete newBundles[event.producerUsername][event.producerInstance];

            if (Object.keys(newBundles[event.producerUsername]).length === 0) {
              delete newBundles[event.producerUsername];
            }
          }

          return newBundles;
        });
      }
    }
  };
}
export default Producers;
