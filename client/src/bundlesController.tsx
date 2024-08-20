import React from "react";
import { Socket } from "socket.io-client";
import Bundle from "./bundle/Bundle";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "./context/StreamsContext";
import {
  beardChinOffsetsMap,
  defaultBeard,
  defaultEars,
  defaultFaceMask,
  defaultGlasses,
  defaultMustache,
  earsWidthFactorMap,
  EffectStylesType,
  mustacheNoseOffsetsMap,
} from "./context/CurrentEffectsStylesContext";

class BundlesController {
  private socket: React.MutableRefObject<Socket>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private instance: React.MutableRefObject<string>;

  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;

  private remoteVideosContainerRef: React.RefObject<HTMLDivElement>;
  private remoteStreamEffects: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: {
        camera: {
          [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
        };
        screen: {
          [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
        };
        audio: { [effectType in AudioEffectTypes]: boolean };
      };
    };
  }>;
  private remoteCurrentEffectsStyles: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: EffectStylesType;
    };
  }>;

  private isCamera: React.MutableRefObject<boolean>;
  private isScreen: React.MutableRefObject<boolean>;
  private isAudio: React.MutableRefObject<boolean>;

  private bundles: {
    [username: string]: { [instance: string]: React.JSX.Element };
  };
  private setBundles: React.Dispatch<
    React.SetStateAction<{
      [username: string]: { [instance: string]: React.JSX.Element };
    }>
  >;

  private muteAudio: () => void;

  private acceptCameraEffects: boolean;
  private acceptScreenEffects: boolean;
  private acceptAudioEffects: boolean;

  constructor(
    socket: React.MutableRefObject<Socket>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    instance: React.MutableRefObject<string>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
    remoteStreamEffects: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera: {
            [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
          };
          screen: {
            [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
          };
          audio: { [effectType in AudioEffectTypes]: boolean };
        };
      };
    }>,
    remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    isCamera: React.MutableRefObject<boolean>,
    isScreen: React.MutableRefObject<boolean>,
    isAudio: React.MutableRefObject<boolean>,
    bundles: {
      [username: string]: { [instance: string]: React.JSX.Element };
    },
    setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,
    muteAudio: () => void,
    acceptCameraEffects: boolean,
    acceptScreenEffects: boolean,
    acceptAudioEffects: boolean
  ) {
    this.socket = socket;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.userMedia = userMedia;
    this.remoteVideosContainerRef = remoteVideosContainerRef;
    this.remoteStreamEffects = remoteStreamEffects;
    this.remoteCurrentEffectsStyles = remoteCurrentEffectsStyles;
    this.isCamera = isCamera;
    this.isScreen = isScreen;
    this.isAudio = isAudio;
    this.bundles = bundles;
    this.setBundles = setBundles;
    this.muteAudio = muteAudio;
    this.acceptCameraEffects = acceptCameraEffects;
    this.acceptScreenEffects = acceptScreenEffects;
    this.acceptAudioEffects = acceptAudioEffects;
  }

  createProducerBundle = () => {
    if (this.remoteVideosContainerRef.current) {
      const initCameraStreams: { [cameraId: string]: MediaStream } = {};
      for (const cameraId in this.userMedia.current.camera) {
        initCameraStreams[cameraId] =
          this.userMedia.current.camera[cameraId].getStream();
      }

      const initScreenStreams: { [screenId: string]: MediaStream } = {};
      for (const screenId in this.userMedia.current.screen) {
        initScreenStreams[screenId] =
          this.userMedia.current.screen[screenId].getStream();
      }

      const initAudioStream = this.userMedia.current.audio?.getStream();

      const newBundle = (
        <Bundle
          table_id={this.table_id.current}
          username={this.username.current}
          instance={this.instance.current}
          socket={this.socket}
          initCameraStreams={
            this.isCamera.current ? initCameraStreams : undefined
          }
          initScreenStreams={
            this.isScreen.current ? initScreenStreams : undefined
          }
          initAudioStream={this.isAudio.current ? initAudioStream : undefined}
          options={{
            isUser: true,
            acceptsCameraEffects: this.acceptCameraEffects,
            acceptsScreenEffects: this.acceptScreenEffects,
            acceptsAudioEffects: this.acceptAudioEffects,
          }}
          handleMuteCallback={this.muteAudio}
        />
      );

      this.setBundles((prev) => {
        const newBundles = {
          ...prev,
          [this.username.current]: {
            ...prev[this.username.current],
            [this.instance.current]: newBundle,
          },
        };
        return newBundles;
      });
    }
  };

  createConsumerBundle = (
    trackUsername: string,
    trackInstance: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => {
    if (
      !this.bundles[trackUsername] ||
      !this.bundles[trackUsername][trackInstance]
    ) {
      if (!this.remoteStreamEffects.current[trackUsername]) {
        this.remoteStreamEffects.current[trackUsername] = {};
      }
      if (!this.remoteStreamEffects.current[trackUsername][trackInstance]) {
        this.remoteStreamEffects.current[trackUsername][trackInstance] = {
          camera: {},
          screen: {},
          audio: {
            robot: false,
            echo: false,
            alien: false,
            underwater: false,
            telephone: false,
          },
        };
      }

      if (!this.remoteCurrentEffectsStyles.current[trackUsername]) {
        this.remoteCurrentEffectsStyles.current[trackUsername] = {};
      }
      if (
        !this.remoteCurrentEffectsStyles.current[trackUsername][trackInstance]
      ) {
        this.remoteCurrentEffectsStyles.current[trackUsername][trackInstance] =
          { camera: {}, screen: {}, audio: {} };
      }

      for (const cameraId in remoteCameraStreams) {
        this.remoteStreamEffects.current[trackUsername][trackInstance].camera[
          cameraId
        ] = {
          pause: false,
          blur: false,
          tint: false,
          ears: false,
          glasses: false,
          beards: false,
          mustaches: false,
          faceMasks: false,
        };

        if (
          !this.remoteCurrentEffectsStyles.current[trackUsername][trackInstance]
            .camera[cameraId]
        ) {
          this.remoteCurrentEffectsStyles.current[trackUsername][
            trackInstance
          ].camera[cameraId] = {
            glasses: { style: defaultGlasses, threeDim: false },
            ears: {
              style: defaultEars,
              threeDim: false,
              leftEarWidthFactor:
                earsWidthFactorMap[defaultEars].leftEarWidthFactor,
              rightEarWidthFactor:
                earsWidthFactorMap[defaultEars].rightEarWidthFactor,
            },
            beards: {
              style: defaultBeard,
              threeDim: false,
              chinOffset: beardChinOffsetsMap[defaultBeard],
            },
            mustaches: {
              style: defaultMustache,
              threeDim: false,
              noseOffset: mustacheNoseOffsetsMap[defaultMustache],
            },
            faceMasks: {
              style: defaultFaceMask,
              threeDim: true,
            },
          };
        }
      }
      for (const screenId in remoteScreenStreams) {
        this.remoteStreamEffects.current[trackUsername][trackInstance].screen[
          screenId
        ] = {
          pause: false,
          blur: false,
          tint: false,
        };

        if (
          !this.remoteCurrentEffectsStyles.current[trackUsername][trackInstance]
            .screen[screenId]
        ) {
          this.remoteCurrentEffectsStyles.current[trackUsername][
            trackInstance
          ].screen[screenId] = {};
        }
      }

      const newBundle = (
        <Bundle
          socket={this.socket}
          table_id={this.table_id.current}
          username={trackUsername}
          instance={trackInstance}
          initCameraStreams={
            Object.keys(remoteCameraStreams).length !== 0
              ? remoteCameraStreams
              : undefined
          }
          initScreenStreams={
            Object.keys(remoteScreenStreams).length !== 0
              ? remoteScreenStreams
              : undefined
          }
          initAudioStream={remoteAudioStream ? remoteAudioStream : undefined}
          onRendered={() => {
            const msg = {
              type: "requestStatesPermissions",
              table_id: this.table_id.current,
              inquiringUsername: this.username.current,
              inquiringInstance: this.instance.current,
              inquiredUsername: trackUsername,
              inquiredInstance: trackInstance,
            };

            this.socket.current.emit("message", msg);
          }}
          onNewConsumerWasCreatedCallback={() => {
            const msg = {
              type: "requestClientMuteState",
              table_id: this.table_id.current,
              username: this.username.current,
              instance: this.instance.current,
              producerUsername: trackUsername,
              producerInstance: trackInstance,
            };

            this.socket.current.emit("message", msg);
          }}
        />
      );

      this.setBundles((prev) => {
        const newBundles = {
          ...prev,
          [trackUsername]: {
            ...prev[trackUsername],
            [trackInstance]: newBundle,
          },
        };
        return newBundles;
      });
    }
  };
}

export default BundlesController;
