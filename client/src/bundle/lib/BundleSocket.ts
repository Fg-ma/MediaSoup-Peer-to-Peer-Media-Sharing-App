import {
  RemoteMediaType,
  UserMediaType,
} from "../../context/mediaContext/typeConstant";
import {
  RemoteEffectStylesType,
  AudioEffectTypes,
  defaultAudioStreamEffects,
  RemoteStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import {
  onBundleMetadataResponsedType,
  onClientEffectChangedType,
  onClientMuteChangeType,
  onEffectChangeRequestedType,
  onNewConsumerWasCreatedType,
  onNewProducerWasCreatedType,
  onPermissionsResponsedType,
  onProducerDisconnectedType,
} from "./typeConstant";
import { Permissions } from "../../context/permissionsContext/typeConstant";

class BundleSocket {
  constructor(
    private isUser: boolean,
    private username: string,
    private instance: string,
    private setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [cameraId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setScreenAudioStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenAudioId: string]: MediaStream;
          }
        | undefined
      >
    >,
    private setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    private remoteMedia: React.MutableRefObject<RemoteMediaType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private permissions: Permissions,
    private setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    private handleAudioEffectChange: (
      producerType: "audio" | "screenAudio",
      producerId: string | undefined,
      effect: AudioEffectTypes
    ) => void,
    private onNewConsumerWasCreatedCallback?: () => void
  ) {}

  onNewConsumerWasCreated = (event: onNewConsumerWasCreatedType) => {
    if (
      this.username !== event.producerUsername ||
      this.instance !== event.producerInstance
    ) {
      return;
    }

    if (event.producerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.producerId) {
          const track =
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].camera?.[event.producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.producerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.producerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.producerId) {
          const track =
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].screen?.[event.producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.producerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.producerType === "screenAudio") {
      this.setScreenAudioStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.producerId) {
          const track =
            this.remoteMedia.current[event.producerUsername][
              event.producerInstance
            ].screenAudio?.[event.producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.producerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      const newStream = new MediaStream();
      const track =
        this.remoteMedia.current[event.producerUsername][event.producerInstance]
          .audio;
      if (track) {
        newStream.addTrack(track);
      }

      this.setAudioStream(newStream);
    }

    if (this.onNewConsumerWasCreatedCallback) {
      this.onNewConsumerWasCreatedCallback();
    }
  };

  onNewProducerWasCreated = (event: onNewProducerWasCreatedType) => {
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
    } else if (event.producerType === "screenAudio") {
      this.setScreenAudioStreams((prev) => {
        const newStreams = { ...prev };
        if (event.producerId) {
          newStreams[event.producerId] =
            this.userMedia.current.screenAudio[event.producerId].getStream();
        }
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      this.setAudioStream(this.userMedia.current.audio?.getStream());
    }
  };

  onProducerDisconnected = (event: onProducerDisconnectedType) => {
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
      } else if (event.producerType === "screenAudio") {
        this.setScreenAudioStreams((prev) => {
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
  onClientMuteChange = (event: onClientMuteChangeType) => {
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

  onPermissionsResponsed = (event: onPermissionsResponsedType) => {
    if (
      this.username !== event.inquiredUsername &&
      this.instance !== event.inquiredInstance
    ) {
      return;
    }

    this.setPermissions(event.data.permissions);
  };

  onBundleMetadataResponsed = (event: onBundleMetadataResponsedType) => {
    if (
      this.username !== event.inquiredUsername ||
      this.instance !== event.inquiredInstance
    ) {
      return;
    }

    if (!this.isUser) {
      this.clientMute.current = event.data.clientMute;
    }

    this.remoteStreamEffects.current[event.inquiredUsername][
      event.inquiredInstance
    ] = event.data.streamEffects;

    this.remoteEffectsStyles.current[event.inquiredUsername][
      event.inquiredInstance
    ] = event.data.userEffectsStyles;
  };

  onEffectChangeRequested = (event: onEffectChangeRequestedType) => {
    if (
      (event.requestedProducerType === "audio" &&
        this.permissions.acceptsAudioEffects) ||
      (event.requestedProducerType === "screenAudio" &&
        this.permissions.acceptsScreenAudioEffects)
    ) {
      this.handleAudioEffectChange(
        event.requestedProducerType,
        event.requestedProducerId,
        // @ts-expect-error: event.effect and event.requestedProducerType have no strict correlation enforcement
        event.effect
      );
    }
  };

  onClientEffectChanged = (event: onClientEffectChangedType) => {
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
        ] = // @ts-expect-error: event.effect and event.producerType have no strict correlation enforcement
          !this.remoteStreamEffects.current[event.username][event.instance]
            .audio[event.effect];
      }
    } else if (
      !this.isUser &&
      this.username === event.username &&
      this.instance === event.instance &&
      event.producerType === "screenAudio" &&
      event.producerId
    ) {
      if (!event.blockStateChange) {
        this.remoteStreamEffects.current[event.username][
          event.instance
        ].screenAudio[event.producerId] = {
          ...defaultAudioStreamEffects,
          [event.effect]:
            // @ts-expect-error: event.effect and event.producerType have no strict correlation enforcement
            !this.remoteStreamEffects.current[event.username][event.instance]
              .screenAudio[event.producerId][event.effect],
        };
      }
    }
  };
}

export default BundleSocket;
