import React from "react";
import { types } from "mediasoup-client";
import { Socket } from "socket.io-client";
import { UserMedia } from "tone";
import { v4 as uuidv4 } from "uuid";
import {
  UserStreamEffectsType,
  RemoteStreamEffectsType,
  defaultAudioStreamEffects,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserEffectsStylesType,
} from "../context/streamEffectsContext/typeConstant";
import {
  DataStreamTypes,
  RemoteDataStreamsType,
  RemoteTracksMapType,
  UserDataStreamsType,
  UserMediaType,
} from "../context/streamsContext/typeConstant";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";
import UserDevice from "./UserDevice";
import BrowserMedia from "./BrowserMedia";
import Deadbanding from "../babylon/Deadbanding";
import ScreenAudioMedia from "./ScreenAudioMedia";
import { Permissions } from "../context/permissionsContext/typeConstant";

class ProducersController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<types.Device | undefined>,

    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private permissions: React.MutableRefObject<Permissions>,

    private userMedia: React.MutableRefObject<UserMediaType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private remoteTracksMap: React.MutableRefObject<RemoteTracksMapType>,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isSubscribed: React.MutableRefObject<boolean>,

    private handleDisableEnableBtns: (disabled: boolean) => void,
    private producerTransport: React.MutableRefObject<
      types.Transport<types.AppData> | undefined
    >,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private createProducerBundle: () => void,
    private bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,

    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private browserMedia: BrowserMedia
  ) {}

  private createCameraProducer = async (
    cameraId: string,
    cameraBrowserMedia: MediaStream
  ) => {
    const newCameraMedia = new CameraMedia(
      cameraId,
      cameraBrowserMedia,
      this.userEffectsStyles,
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

  private createScreenProducer = async (
    screenId: string,
    originalScreenBrowserMedia: MediaStream,
    screenBrowserMedia: MediaStream
  ) => {
    const newScreenMedia = new ScreenMedia(
      screenId,
      originalScreenBrowserMedia,
      screenBrowserMedia,
      this.userEffectsStyles,
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
      audioBrowserMedia,
      this.userStreamEffects
    );

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

  private createScreenAudioProducer = async (
    screenId: string,
    screenAudioBrowserMedia: MediaStream
  ) => {
    const screenAudioId = `${screenId}_audio`;
    const newScreenAudioMedia = new ScreenAudioMedia(
      screenAudioId,
      screenAudioBrowserMedia,
      this.userStreamEffects
    );

    this.userMedia.current.screenAudio[screenAudioId] = newScreenAudioMedia;

    const screenAudioTracks =
      this.userMedia.current.screenAudio[screenAudioId].getMasterTrack();
    const screenAudioParams = {
      track: screenAudioTracks,
      appData: {
        producerType: "screenAudio",
        producerId: screenAudioId,
      },
    };

    await this.producerTransport.current?.produce(screenAudioParams);
  };

  createJSONProducer = async (dataStreamType: DataStreamTypes) => {
    if (!this.producerTransport.current) {
      console.error("No transport available to create JSON data producer");
      return;
    }

    const jsonId = `${this.username.current}_${this.instance.current}_${dataStreamType}_data_stream`;
    const label = `${this.username.current}_${this.instance.current}_${dataStreamType}`;

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
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
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

    await this.createJSONProducer("positionScaleRotation");
  };

  createNewProducer = async (producerType: "camera" | "screen" | "audio") => {
    if (
      !this.bundles[this.username.current] ||
      !Object.keys(this.bundles[this.username.current]).includes(
        this.instance.current
      )
    ) {
      this.createProducerBundle();
    }

    let producerId: string | undefined;
    if (producerType === "camera") {
      // prettier-ignore
      producerId = `${this.username.current}_${this.instance.current}_camera_stream_${uuidv4()}`;

      if (this.userMedia.current.camera[producerId]) {
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

      await this.createCameraProducer(producerId, cameraBrowserMedia);
    } else if (producerType === "screen") {
      // prettier-ignore
      producerId = `${this.username.current}_${this.instance.current}_screen_stream_${uuidv4()}`;

      if (this.userMedia.current.screen[producerId]) {
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

      const videoTrack = screenBrowserMedia.getVideoTracks()[0];
      const audioTrack = screenBrowserMedia.getAudioTracks()[0];

      await this.createScreenProducer(
        producerId,
        screenBrowserMedia,
        new MediaStream([videoTrack])
      );
      if (audioTrack) {
        await this.createScreenAudioProducer(
          producerId,
          new MediaStream([audioTrack])
        );
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
        producerType: event.producerType,
        rtpCapabilities: rtpCapabilities,
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerUsername: event.producerUsername,
        producerInstance: event.producerInstance,
        producerId: event.producerId,
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
        producerType: event.producerType,
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
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId?: string;
    dataStreamType?: DataStreamTypes;
  }) => {
    if (
      event.producerUsername === this.username.current &&
      event.producerInstance === this.instance.current
    ) {
      // Call deconstructors then delete userMedia
      if (
        event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio"
      ) {
        if (
          event.producerId &&
          this.userMedia.current[event.producerType][event.producerId]
        ) {
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

      if (
        event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio" ||
        event.producerType === "audio"
      ) {
        // Delete old stream effects
        const streamEffects =
          this.userStreamEffects.current?.[event.producerType];

        if (streamEffects) {
          if (event.producerType === "audio") {
            this.userStreamEffects.current.audio = structuredClone(
              defaultAudioStreamEffects
            );
          } else if (
            event.producerType === "camera" ||
            event.producerType === "screen" ||
            event.producerType === "screenAudio"
          ) {
            if (event.producerId && event.producerId in streamEffects) {
              delete this.userStreamEffects.current[event.producerType][
                event.producerId as keyof typeof streamEffects
              ];
            }
          }
        }

        // Delete old effects styles
        if (this.userEffectsStyles.current?.[event.producerType]) {
          if (event.producerType === "audio") {
            this.userEffectsStyles.current.audio = structuredClone(
              defaultAudioEffectsStyles
            );
          } else if (
            event.producerType === "camera" ||
            event.producerType === "screen" ||
            event.producerType === "screenAudio"
          ) {
            if (
              event.producerId &&
              event.producerId in
                this.userEffectsStyles.current[event.producerType]
            ) {
              delete this.userEffectsStyles.current[event.producerType][
                event.producerId
              ];
            }
          }
        }
      }

      // Clean up bundles and producer transport if necessary
      if (
        (!this.userMedia.current.camera ||
          Object.keys(this.userMedia.current.camera).length === 0) &&
        (!this.userMedia.current.screen ||
          Object.keys(this.userMedia.current.screen).length === 0) &&
        (!this.userMedia.current.screenAudio ||
          Object.keys(this.userMedia.current.screenAudio).length === 0) &&
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
      }

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
      if (
        event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio"
      ) {
        if (
          event.producerId &&
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
      } else if (event.producerType === "json") {
        if (
          event.dataStreamType &&
          this.remoteDataStreams.current[event.producerUsername] &&
          this.remoteDataStreams.current[event.producerUsername][
            event.producerInstance
          ] &&
          this.remoteDataStreams.current[event.producerUsername][
            event.producerInstance
          ] &&
          this.remoteDataStreams.current[event.producerUsername][
            event.producerInstance
          ]?.[event.dataStreamType]
        ) {
          delete this.remoteDataStreams.current[event.producerUsername][
            event.producerInstance
          ][event.dataStreamType];

          if (
            Object.keys(
              this.remoteDataStreams.current[event.producerUsername][
                event.producerInstance
              ] || { break: true }
            ).length === 0
          ) {
            delete this.remoteDataStreams.current[event.producerUsername][
              event.producerInstance
            ];

            if (
              Object.keys(
                this.remoteDataStreams.current[event.producerUsername] || {
                  break: true,
                }
              ).length === 0
            ) {
              delete this.remoteDataStreams.current[event.producerUsername];
            }
          }
        }
      }

      if (
        event.producerType === "camera" ||
        event.producerType === "screen" ||
        event.producerType === "screenAudio" ||
        event.producerType === "audio"
      ) {
        // Delete old stream effects
        const streamEffects =
          event.producerId &&
          (event.producerType === "camera" ||
            event.producerType === "screen" ||
            event.producerType === "screenAudio")
            ? this.remoteStreamEffects.current?.[event.producerUsername]?.[
                event.producerInstance
              ]?.[event.producerType]?.[event.producerId]
            : this.remoteStreamEffects.current?.[event.producerUsername]?.[
                event.producerInstance
              ]?.[event.producerType];

        if (streamEffects) {
          if (event.producerType === "audio") {
            this.remoteStreamEffects.current[event.producerUsername][
              event.producerInstance
            ][event.producerType] = structuredClone(defaultAudioStreamEffects);
          } else if (
            event.producerType === "camera" ||
            event.producerType === "screen" ||
            event.producerType === "screenAudio"
          ) {
            if (event.producerId && event.producerId in streamEffects) {
              delete this.remoteStreamEffects.current[event.producerUsername][
                event.producerInstance
              ][event.producerType][event.producerId];
            }
          }
        }

        // Delete old effects styles
        if (
          this.remoteEffectsStyles.current?.[event.producerUsername]?.[
            event.producerInstance
          ]?.[event.producerType]
        ) {
          if (event.producerType === "audio") {
            this.remoteEffectsStyles.current[event.producerUsername][
              event.producerInstance
            ][event.producerType] = structuredClone(defaultAudioEffectsStyles);
          } else if (
            event.producerType === "camera" ||
            event.producerType === "screen" ||
            event.producerType === "screenAudio"
          ) {
            if (
              event.producerId &&
              event.producerId in
                this.remoteEffectsStyles.current[event.producerUsername][
                  event.producerInstance
                ][event.producerType]
            ) {
              delete this.remoteEffectsStyles.current[event.producerUsername][
                event.producerInstance
              ][event.producerType][event.producerId];
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

  onRemoveProducerRequested = (event: {
    type: "removeProducerRequested";
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId: string;
  }) => {
    if (this.permissions.current.acceptsCloseMedia) {
      const msg = {
        type: "removeProducer",
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType: event.producerType,
        producerId: event.producerId,
      };
      this.socket.current.emit("message", msg);
    }
  };
}
export default ProducersController;
