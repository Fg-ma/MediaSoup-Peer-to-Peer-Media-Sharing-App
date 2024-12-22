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
    const { producerUsername, producerInstance, producerType, producerId } =
      event.data;

    if (
      this.username !== producerUsername ||
      this.instance !== producerInstance
    ) {
      return;
    }

    if (producerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (producerId) {
          const track =
            this.remoteMedia.current[producerUsername][producerInstance]
              .camera?.[producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[producerId] = newStream;
        }
        return newStreams;
      });
    } else if (producerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (producerId) {
          const track =
            this.remoteMedia.current[producerUsername][producerInstance]
              .screen?.[producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[producerId] = newStream;
        }
        return newStreams;
      });
    } else if (producerType === "screenAudio") {
      this.setScreenAudioStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (producerId) {
          const track =
            this.remoteMedia.current[producerUsername][producerInstance]
              .screenAudio?.[producerId];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[producerId] = newStream;
        }
        return newStreams;
      });
    } else if (producerType === "audio") {
      const newStream = new MediaStream();
      const track =
        this.remoteMedia.current[producerUsername][producerInstance].audio;
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

    const { producerType, producerId } = event.data;

    if (producerType === "camera") {
      this.setCameraStreams((prev) => {
        const newStreams = { ...prev };
        if (producerId) {
          newStreams[producerId] =
            this.userMedia.current.camera[producerId].getStream();
        }
        return newStreams;
      });
    } else if (producerType === "screen") {
      this.setScreenStreams((prev) => {
        const newStreams = { ...prev };
        if (producerId) {
          newStreams[producerId] =
            this.userMedia.current.screen[producerId].getStream();
        }
        return newStreams;
      });
    } else if (producerType === "screenAudio") {
      this.setScreenAudioStreams((prev) => {
        const newStreams = { ...prev };
        if (producerId) {
          newStreams[producerId] =
            this.userMedia.current.screenAudio[producerId].getStream();
        }
        return newStreams;
      });
    } else if (producerType === "audio") {
      this.setAudioStream(this.userMedia.current.audio?.getStream());
    }
  };

  onProducerDisconnected = (event: onProducerDisconnectedType) => {
    const { producerUsername, producerInstance, producerType, producerId } =
      event.data;

    if (
      producerUsername === this.username &&
      producerInstance === this.instance
    ) {
      if (producerType === "camera") {
        this.setCameraStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[producerId];
          return newStreams;
        });
      } else if (producerType === "screen") {
        this.setScreenStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[producerId];
          return newStreams;
        });
      } else if (producerType === "screenAudio") {
        this.setScreenAudioStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[producerId];
          return newStreams;
        });
      } else if (producerType === "audio") {
        this.setAudioStream(undefined);
      }
    }
  };

  // Get client mute changes from other users
  onClientMuteChange = (event: onClientMuteChangeType) => {
    if (this.isUser) {
      return;
    }

    const { clientMute } = event.data;

    this.clientMute.current = clientMute;
  };

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
    const { inquiredUsername, inquiredInstance, permissions } = event.data;

    if (
      this.username !== inquiredUsername &&
      this.instance !== inquiredInstance
    ) {
      return;
    }

    this.setPermissions(permissions);
  };

  onBundleMetadataResponsed = (event: onBundleMetadataResponsedType) => {
    const {
      inquiredUsername,
      inquiredInstance,
      clientMute,
      streamEffects,
      userEffectsStyles,
    } = event.data;

    if (
      this.username !== inquiredUsername ||
      this.instance !== inquiredInstance
    ) {
      return;
    }

    if (!this.isUser) {
      this.clientMute.current = clientMute;
    }

    this.remoteStreamEffects.current[inquiredUsername][inquiredInstance] =
      streamEffects;

    this.remoteEffectsStyles.current[inquiredUsername][inquiredInstance] =
      userEffectsStyles;
  };

  onEffectChangeRequested = (event: onEffectChangeRequestedType) => {
    const { requestedProducerType, requestedProducerId, effect } = event.data;

    if (
      (requestedProducerType === "audio" &&
        this.permissions.acceptsAudioEffects) ||
      (requestedProducerType === "screenAudio" &&
        this.permissions.acceptsScreenAudioEffects)
    ) {
      this.handleAudioEffectChange(
        requestedProducerType,
        requestedProducerId,
        // @ts-expect-error: effect and requestedProducerType have no strict correlation enforcement
        effect
      );
    }
  };

  onClientEffectChanged = (event: onClientEffectChangedType) => {
    const {
      username,
      instance,
      producerType,
      producerId,
      blockStateChange,
      effect,
    } = event.data;

    if (
      !this.isUser &&
      this.username === username &&
      this.instance === instance &&
      producerType === "audio"
    ) {
      if (!blockStateChange) {
        // @ts-expect-error: effect and producerType have no strict correlation enforcement
        this.remoteStreamEffects.current[username][instance].audio[effect] = // @ts-expect-error: effect and producerType have no strict correlation enforcement
          !this.remoteStreamEffects.current[username][instance].audio[effect];
      }
    } else if (
      !this.isUser &&
      this.username === username &&
      this.instance === instance &&
      producerType === "screenAudio" &&
      producerId
    ) {
      if (!blockStateChange) {
        this.remoteStreamEffects.current[username][instance].screenAudio[
          producerId
        ] = {
          ...defaultAudioStreamEffects,
          [effect]:
            // @ts-expect-error: effect and producerType have no strict correlation enforcement
            !this.remoteStreamEffects.current[username][instance].screenAudio[
              producerId
            ][effect],
        };
      }
    }
  };
}

export default BundleSocket;
