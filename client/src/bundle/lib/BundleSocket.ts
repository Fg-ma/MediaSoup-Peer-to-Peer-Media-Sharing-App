import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import { EffectStylesType } from "../../context/currentEffectsStylesContext/typeConstant";
import AudioMedia from "../../lib/AudioMedia";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import { Permissions } from "../../context/permissionsContext/PermissionsContext";

class BundleSocket {
  constructor(
    private isUser: boolean,
    private username: string,
    private instance: string,
    private setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenKey: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    private remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera?:
            | {
                [cameraId: string]: MediaStreamTrack;
              }
            | undefined;
          screen?:
            | {
                [screenId: string]: MediaStreamTrack;
              }
            | undefined;
          audio?: MediaStreamTrack | undefined;
        };
      };
    }>,
    private remoteStreamEffects: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          camera: {
            [cameraId: string]: {
              [effectType in CameraEffectTypes]: boolean;
            };
          };
          screen: {
            [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
          };
          audio: { [effectType in AudioEffectTypes]: boolean };
        };
      };
    }>,
    private remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private permissions: Permissions,
    private setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    private handleAudioEffectChange: (effect: AudioEffectTypes) => void,
    private onNewConsumerWasCreatedCallback?: () => void
  ) {}

  onNewConsumerWasCreated = (event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
    consumerId?: string;
    consumerType: string;
  }) => {
    if (
      this.username !== event.producerUsername ||
      this.instance !== event.producerInstance
    ) {
      return;
    }

    if (event.consumerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ].camera?.[event.consumerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ].screen?.[event.consumerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "audio") {
      const newStream = new MediaStream();
      const track =
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].audio;
      if (track) {
        newStream.addTrack(track);
      }

      this.setAudioStream(newStream);
    }

    if (this.onNewConsumerWasCreatedCallback) {
      this.onNewConsumerWasCreatedCallback();
    }
  };

  onNewProducerWasCreated = (event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
  }) => {
    if (!this.isUser) {
      return;
    }

    if (event.producerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        if (event.producerId) {
          newStreams[event.producerId] =
            this.userMedia.current.camera[event.producerId].getStream();
        }
        return newStreams;
      });
    } else if (event.producerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        if (event.producerId) {
          newStreams[event.producerId] =
            this.userMedia.current.screen[event.producerId].getStream();
        }
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      this.setAudioStream(this.userMedia.current.audio?.getStream());
    }
  };

  onProducerDisconnected = (event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
    producerType: string;
    producerId: string;
  }) => {
    if (
      event.producerUsername === this.username &&
      event.producerInstance === this.instance
    ) {
      if (event.producerType === "camera") {
        this.setCameraStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "screen") {
        this.setScreenStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "audio") {
        this.setAudioStream(undefined);
      }
    }
  };

  // Get client mute changes from other users
  onClientMuteChange = (event: {
    type: string;
    username: string;
    clientMute: boolean;
  }) => {
    if (this.isUser) {
      return;
    }

    this.clientMute.current = event.clientMute;
  };

  // Handles local mute changes from outside bundle
  onLocalMuteChange = () => {
    if (this.clientMute.current) {
      return;
    }

    this.localMute.current = !this.localMute.current;

    if (!this.isUser && this.audioRef.current) {
      this.audioRef.current.muted = this.localMute.current;
    }
  };

  onStatesPermissionsResponsed = (event: {
    type: "statesPermissionsResponsed";
    inquiredUsername: string;
    inquiredInstance: string;
    clientMute: boolean;
    permissions: Permissions;
    streamEffects: {
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    };
    currentEffectsStyles: EffectStylesType;
  }) => {
    if (
      this.username !== event.inquiredUsername &&
      this.instance !== event.inquiredInstance
    ) {
      return;
    }

    if (this.isUser) {
      this.clientMute.current = event.clientMute;
    }

    this.setPermissions(event.permissions);

    this.remoteStreamEffects.current[this.username][this.instance] =
      event.streamEffects;

    this.remoteCurrentEffectsStyles.current[this.username][this.instance] =
      event.currentEffectsStyles;
  };

  onEffectChangeRequested = (event: {
    type: "effectChangeRequested";
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    blockStateChange: boolean;
  }) => {
    if (
      this.permissions.acceptsAudioEffects &&
      event.requestedProducerType === "audio"
    ) {
      // @ts-expect-error: event.effect and event.requestedProducerType have no strict correlation enforcement
      this.handleAudioEffectChange(event.effect);
    }
  };

  onClientEffectChanged = (event: {
    type: "clientEffectChanged";
    username: string;
    instance: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes;
    blockStateChange: boolean;
  }) => {
    if (
      !this.isUser &&
      this.username === event.username &&
      this.instance === event.instance &&
      event.producerType === "audio"
    ) {
      if (!event.blockStateChange) {
        // @ts-expect-error: event.effect and event.producerType have no strict correlation enforcement
        this.remoteStreamEffects.current[event.username][event.instance].audio[
          event.effect
        ] =
          // @ts-expect-error: event.effect and event.producerType have no strict correlation enforcement
          !this.remoteStreamEffects.current[event.username][event.instance]
            .audio[event.effect];
      }
    }
  };
}

export default BundleSocket;
