import React from "react";
import { types } from "mediasoup-client";
import { UserMedia } from "tone";
import { v4 as uuidv4 } from "uuid";
import {
  UserEffectsType,
  RemoteEffectsType,
  defaultAudioEffects,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserEffectsStylesType,
} from "../../../universal/effectsTypeConstant";
import {
  DataStreamTypes,
  RemoteDataStreamsType,
  RemoteMediaType,
  UserDataStreamsType,
  UserMediaType,
} from "../context/mediaContext/typeConstant";
import CameraMedia from "../media/fgVisualMedia/CameraMedia";
import ScreenMedia from "../media/fgVisualMedia/ScreenMedia";
import AudioMedia from "../media/audio/AudioMedia";
import UserDevice from "./UserDevice";
import BrowserMedia from "../media/BrowserMedia";
import Deadbanding from "../babylon/Deadbanding";
import ScreenAudioMedia from "../media/screenAudio/ScreenAudioMedia";
import { Permissions } from "../context/permissionsContext/typeConstant";
import MediasoupSocketController from "../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  IncomingMediasoupMessages,
  onNewJSONProducerAvailableType,
  onNewProducerAvailableType,
  onProducerDisconnectedType,
  onProducerTransportCreatedType,
  onRemoveProducerRequestedType,
} from "../serverControllers/mediasoupServer/lib/typeConstant";

class ProducersController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private device: React.MutableRefObject<types.Device | undefined>,

    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private permissions: React.MutableRefObject<Permissions>,

    private userMedia: React.MutableRefObject<UserMediaType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private remoteEffects: React.MutableRefObject<RemoteEffectsType>,
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private userDataStreams: React.MutableRefObject<UserDataStreamsType>,
    private remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isAudio: React.MutableRefObject<boolean>,
    private isSubscribed: React.MutableRefObject<boolean>,

    private handleDisableEnableBtns: (disabled: boolean) => void,
    private producerTransport: React.MutableRefObject<
      types.Transport<types.AppData> | undefined
    >,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
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
    private browserMedia: BrowserMedia,
  ) {}

  private createCameraProducer = async (
    cameraId: string,
    cameraBrowserMedia: MediaStream,
  ) => {
    const newCameraMedia = new CameraMedia(
      cameraId,
      cameraBrowserMedia,
      this.userEffectsStyles,
      this.userEffects,
      this.userDevice,
      this.deadbanding,
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
    screenBrowserMedia: MediaStream,
  ) => {
    const newScreenMedia = new ScreenMedia(
      this.table_id.current,
      this.username.current,
      this.instance.current,
      screenId,
      this.mediasoupSocket,
      originalScreenBrowserMedia,
      screenBrowserMedia,
      this.userEffectsStyles,
      this.userEffects,
      this.userDevice,
      this.userMedia,
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
    const newAudioMedia = new AudioMedia(audioBrowserMedia, this.userEffects);

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
    screenAudioBrowserMedia: MediaStream,
  ) => {
    const screenAudioId = `${screenId}_audio`;
    const newScreenAudioMedia = new ScreenAudioMedia(
      screenAudioId,
      screenAudioBrowserMedia,
      this.userEffects,
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

  onProducerTransportCreated = async (
    event: onProducerTransportCreatedType,
  ) => {
    if (event.error) {
      console.error("Producer transport create error: ", event.error);
      return;
    }

    const { params } = event.data;

    if (!this.device.current) {
      console.error("No device found");
      return;
    }
    this.producerTransport.current =
      this.device.current.createSendTransport(params);

    this.producerTransport.current.on(
      "connect",
      async ({ dtlsParameters }, callback, _errback) => {
        this.mediasoupSocket.current?.sendMessage({
          type: "connectProducerTransport",
          header: {
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
          },
          data: {
            dtlsParameters,
          },
        });
        const producerConnectedCallback = (
          event: IncomingMediasoupMessages,
        ) => {
          if (event.type === "producerConnected") {
            callback();
            this.mediasoupSocket.current?.removeMessageListener(
              producerConnectedCallback,
            );
          }
        };
        this.mediasoupSocket.current?.addMessageListener(
          producerConnectedCallback,
        );
      },
    );

    // Begin transport on producer
    this.producerTransport.current.on(
      "produce",
      async (params, callback, _errback) => {
        const { kind, rtpParameters, appData } = params;

        this.mediasoupSocket.current?.sendMessage({
          type: "createNewProducer",
          header: {
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: appData.producerType as
              | "screen"
              | "audio"
              | "screenAudio"
              | "camera",
            producerId: appData.producerId as string | undefined,
          },
          data: {
            transportId: this.producerTransport.current?.id ?? "",
            kind,
            rtpParameters,
          },
        });

        const producerCallback = (event: IncomingMediasoupMessages) => {
          if (event.type === "newProducerCallback") {
            callback(event.data);
            this.mediasoupSocket.current?.removeMessageListener(
              producerCallback,
            );
          }
        };
        this.mediasoupSocket.current?.addMessageListener(producerCallback);
        return;
      },
    );

    this.producerTransport.current.on(
      "producedata",
      async (params, callback, _errback) => {
        // Create the producer based on params
        const { label, protocol, sctpStreamParameters, appData } = params;

        this.mediasoupSocket.current?.sendMessage({
          type: "createNewJSONProducer",
          header: {
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: appData.producerType as "json",
            producerId: appData.producerId as string,
            dataStreamType: appData.dataStreamType as DataStreamTypes,
          },
          data: {
            transportId: this.producerTransport.current?.id ?? "",
            label: label ?? "",
            protocol: protocol as "json",
            sctpStreamParameters: sctpStreamParameters as types.SctpParameters,
          },
        });

        const jsonProducerCallback = (event: IncomingMediasoupMessages) => {
          if (event.type === "newJSONProducerCallback") {
            callback(event.data);
            this.mediasoupSocket.current?.removeMessageListener(
              jsonProducerCallback,
            );
          }
        };
        this.mediasoupSocket.current?.addMessageListener(jsonProducerCallback);
        return;
      },
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
        this.instance.current,
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
          this.username.current,
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
          this.username.current,
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
        new MediaStream([videoTrack]),
      );
      if (audioTrack) {
        await this.createScreenAudioProducer(
          producerId,
          new MediaStream([audioTrack]),
        );
      }
    } else if (producerType === "audio") {
      if (this.userMedia.current.audio) {
        // Reenable buttons
        this.handleDisableEnableBtns(false);

        console.error(
          "Already existing audio stream for: ",
          this.username.current,
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

    this.mediasoupSocket.current?.sendMessage({
      type: "newProducerCreated",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType,
        producerId,
      },
    });
  };

  onNewProducerAvailable = (event: onNewProducerAvailableType) => {
    const { producerUsername, producerInstance, producerType, producerId } =
      event.header;

    if (
      producerInstance !== this.instance.current &&
      this.isSubscribed.current &&
      this.device.current
    ) {
      const { rtpCapabilities } = this.device.current;

      this.mediasoupSocket.current?.sendMessage({
        type: "newConsumer",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
        data: {
          producerUsername,
          producerInstance,
          producerType,
          producerId,
          rtpCapabilities,
        },
      });
    }
  };

  onNewJSONProducerAvailable = (event: onNewJSONProducerAvailableType) => {
    const {
      producerUsername,
      producerInstance,
      producerType,
      producerId,
      dataStreamType,
    } = event.header;

    if (
      producerInstance !== this.instance.current &&
      this.isSubscribed.current &&
      this.device.current
    ) {
      const { sctpCapabilities } = this.device.current;

      this.mediasoupSocket.current?.sendMessage({
        type: "newJSONConsumer",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        },
        data: {
          producerUsername,
          producerInstance,
          producerType,
          incomingProducerId: producerId,
          dataStreamType,
          sctpCapabilities,
        },
      });
    }
  };

  onProducerDisconnected = (event: onProducerDisconnectedType) => {
    const {
      producerUsername,
      producerInstance,
      producerType,
      producerId,
      dataStreamType,
    } = event.header;

    if (
      producerUsername === this.username.current &&
      producerInstance === this.instance.current
    ) {
      // Call deconstructors then delete userMedia
      if (
        producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio"
      ) {
        if (producerId && this.userMedia.current[producerType][producerId]) {
          this.userMedia.current[producerType][producerId].deconstructor();
          delete this.userMedia.current[producerType][producerId];
        }
      } else if (producerType === "audio") {
        if (this.userMedia.current[producerType]) {
          this.userMedia.current[producerType]?.deconstructor();
          this.userMedia.current[producerType] = undefined;
        }
      }

      if (
        producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio" ||
        producerType === "audio"
      ) {
        // Delete old stream effects
        const streamEffects = this.userEffects.current?.[producerType];

        if (streamEffects) {
          if (producerType === "audio") {
            this.userEffects.current.audio =
              structuredClone(defaultAudioEffects);
          } else if (
            producerType === "camera" ||
            producerType === "screen" ||
            producerType === "screenAudio"
          ) {
            if (producerId && producerId in streamEffects) {
              delete this.userEffects.current[producerType][
                producerId as keyof typeof streamEffects
              ];
            }
          }
        }

        // Delete old effects styles
        if (this.userEffectsStyles.current?.[producerType]) {
          if (producerType === "audio") {
            this.userEffectsStyles.current.audio = structuredClone(
              defaultAudioEffectsStyles,
            );
          } else if (
            producerType === "camera" ||
            producerType === "screen" ||
            producerType === "screenAudio"
          ) {
            if (
              producerId &&
              producerId in this.userEffectsStyles.current[producerType]
            ) {
              delete this.userEffectsStyles.current[producerType][producerId];
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
            newBundles[producerUsername] &&
            newBundles[producerUsername][producerInstance]
          ) {
            delete newBundles[producerUsername][producerInstance];

            if (Object.keys(newBundles[producerUsername]).length === 0) {
              delete newBundles[producerUsername];
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
      if (!this.userMedia.current.audio) {
        this.isAudio.current = false;
        this.setAudioActive(false);
      } else {
        this.isAudio.current = true;
        this.setAudioActive(true);
      }

      // Re-enable button
      this.handleDisableEnableBtns(false);
    } else {
      // Delete remote tracks
      if (
        producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio"
      ) {
        if (
          producerId &&
          this.remoteMedia.current[producerUsername] &&
          this.remoteMedia.current[producerUsername][producerInstance] &&
          this.remoteMedia.current[producerUsername][producerInstance][
            producerType
          ] &&
          this.remoteMedia.current[producerUsername][producerInstance][
            producerType
          ]![producerId]
        ) {
          delete this.remoteMedia.current[producerUsername][producerInstance]?.[
            producerType
          ]?.[producerId];

          if (
            Object.keys(
              this.remoteMedia.current[producerUsername][producerInstance][
                producerType
              ] || { break: true },
            ).length === 0
          ) {
            delete this.remoteMedia.current[producerUsername][
              producerInstance
            ]?.[producerType];

            if (
              Object.keys(
                this.remoteMedia.current[producerUsername][
                  producerInstance
                ] || { break: true },
              ).length === 0
            ) {
              delete this.remoteMedia.current[producerUsername][
                producerInstance
              ];

              if (
                Object.keys(
                  this.remoteMedia.current[producerUsername] || {
                    break: true,
                  },
                ).length === 0
              ) {
                delete this.remoteMedia.current[producerUsername];
              }
            }
          }
        }
      } else if (producerType === "audio") {
        if (
          this.remoteMedia.current[producerUsername] &&
          this.remoteMedia.current[producerUsername][producerInstance] &&
          this.remoteMedia.current[producerUsername][producerInstance][
            producerType
          ]
        ) {
          delete this.remoteMedia.current[producerUsername][producerInstance][
            producerType
          ];

          if (
            Object.keys(
              this.remoteMedia.current[producerUsername][producerInstance] || {
                break: true,
              },
            ).length === 0
          ) {
            delete this.remoteMedia.current[producerUsername][producerInstance];

            if (
              Object.keys(
                this.remoteMedia.current[producerUsername] || {
                  break: true,
                },
              ).length === 0
            ) {
              delete this.remoteMedia.current[producerUsername];
            }
          }
        }
      } else if (producerType === "json") {
        if (
          dataStreamType &&
          this.remoteDataStreams.current[producerUsername] &&
          this.remoteDataStreams.current[producerUsername][producerInstance] &&
          this.remoteDataStreams.current[producerUsername][producerInstance] &&
          this.remoteDataStreams.current[producerUsername][producerInstance]?.[
            dataStreamType
          ]
        ) {
          delete this.remoteDataStreams.current[producerUsername][
            producerInstance
          ][dataStreamType];

          if (
            Object.keys(
              this.remoteDataStreams.current[producerUsername][
                producerInstance
              ] || { break: true },
            ).length === 0
          ) {
            delete this.remoteDataStreams.current[producerUsername][
              producerInstance
            ];

            if (
              Object.keys(
                this.remoteDataStreams.current[producerUsername] || {
                  break: true,
                },
              ).length === 0
            ) {
              delete this.remoteDataStreams.current[producerUsername];
            }
          }
        }
      }

      if (
        producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio" ||
        producerType === "audio"
      ) {
        // Delete old stream effects
        const streamEffects =
          producerId &&
          (producerType === "camera" ||
            producerType === "screen" ||
            producerType === "screenAudio")
            ? this.remoteEffects.current?.[producerUsername]?.[
                producerInstance
              ]?.[producerType]?.[producerId]
            : this.remoteEffects.current?.[producerUsername]?.[
                producerInstance
              ]?.[producerType];

        if (streamEffects) {
          if (producerType === "audio") {
            this.remoteEffects.current[producerUsername][producerInstance][
              producerType
            ] = structuredClone(defaultAudioEffects);
          } else if (
            producerType === "camera" ||
            producerType === "screen" ||
            producerType === "screenAudio"
          ) {
            if (producerId && producerId in streamEffects) {
              delete this.remoteEffects.current[producerUsername][
                producerInstance
              ][producerType][producerId];
            }
          }
        }

        // Delete old effects styles
        if (
          this.remoteEffectsStyles.current?.[producerUsername]?.[
            producerInstance
          ]?.[producerType]
        ) {
          if (producerType === "audio") {
            this.remoteEffectsStyles.current[producerUsername][
              producerInstance
            ][producerType] = structuredClone(defaultAudioEffectsStyles);
          } else if (
            producerType === "camera" ||
            producerType === "screen" ||
            producerType === "screenAudio"
          ) {
            if (
              producerId &&
              producerId in
                this.remoteEffectsStyles.current[producerUsername][
                  producerInstance
                ][producerType]
            ) {
              delete this.remoteEffectsStyles.current[producerUsername][
                producerInstance
              ][producerType][producerId];
            }
          }
        }
      }

      // Clean up bundles
      if (
        !this.remoteMedia.current[producerUsername] ||
        !this.remoteMedia.current[producerUsername][producerInstance]
      ) {
        this.setBundles((prev) => {
          const newBundles = { ...prev };

          if (
            newBundles[producerUsername] &&
            newBundles[producerUsername][producerInstance]
          ) {
            delete newBundles[producerUsername][producerInstance];

            if (Object.keys(newBundles[producerUsername]).length === 0) {
              delete newBundles[producerUsername];
            }
          }

          return newBundles;
        });
      }
    }
  };

  onRemoveProducerRequested = (event: onRemoveProducerRequestedType) => {
    if (!this.permissions.current.acceptsCloseMedia) {
      return;
    }

    const { producerType, producerId } = event.header;

    this.mediasoupSocket.current?.sendMessage({
      type: "removeProducer",
      header: {
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType,
        producerId,
      },
    });
  };
}
export default ProducersController;
