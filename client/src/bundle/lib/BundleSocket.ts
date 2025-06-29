import {
  RemoteMediaType,
  UserMediaType,
} from "../../context/mediaContext/lib/typeConstant";
import {
  RemoteEffectStylesType,
  AudioEffectTypes,
  defaultAudioEffects,
  RemoteEffectsType,
} from "../../../../universal/effectsTypeConstant";
import { BundleOptions } from "./typeConstant";
import { Permissions } from "../../context/permissionsContext/lib/typeConstant";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  onBundleMetadataResponsedType,
  onClientEffectChangedType,
  onClientMuteChangeType,
  onEffectChangeRequestedType,
  onNewConsumerWasCreatedType,
  onNewProducerWasCreatedType,
  onPermissionsResponsedType,
  onProducerDisconnectedType,
} from "../../serverControllers/mediasoupServer/lib/typeConstant";

class BundleSocket {
  constructor(
    protected mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    protected isUser: boolean,
    protected tableId: string,
    protected username: string,
    protected instance: string,
    protected bundleOptions: BundleOptions,
    protected setCameraStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [cameraId: string]: MediaStream;
          }
        | undefined
      >
    >,
    protected setScreenStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenId: string]: MediaStream;
          }
        | undefined
      >
    >,
    protected setScreenAudioStreams: React.Dispatch<
      React.SetStateAction<
        | {
            [screenAudioId: string]: MediaStream;
          }
        | undefined
      >
    >,
    protected setAudioStream: React.Dispatch<
      React.SetStateAction<MediaStream | undefined>
    >,
    protected remoteMedia: React.MutableRefObject<RemoteMediaType>,
    protected remoteEffects: React.MutableRefObject<RemoteEffectsType>,
    protected remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>,
    protected userMedia: React.MutableRefObject<UserMediaType>,
    protected audioRef: React.RefObject<HTMLAudioElement>,
    protected clientMute: React.MutableRefObject<boolean>,
    protected screenAudioClientMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    protected localMute: React.MutableRefObject<boolean>,
    protected screenAudioLocalMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    protected permissions: Permissions,
    protected setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    protected onNewConsumerWasCreatedCallback: (() => void) | undefined,
  ) {}

  handleAudioEffectChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes,
  ) => {
    if (this.bundleOptions.isUser) {
      if (producerType === "audio") {
        this.userMedia.current.audio?.changeEffects(effect, false);
      } else if (producerType === "screenAudio" && producerId) {
        this.userMedia.current.screenAudio[producerId].changeEffects(
          effect,
          false,
        );
      }

      if (
        (producerType === "audio" && this.permissions.acceptsAudioEffects) ||
        (producerType === "screenAudio" &&
          this.permissions.acceptsScreenAudioEffects)
      ) {
        this.mediasoupSocket.current?.sendMessage({
          type: "clientEffectChange",
          header: {
            tableId: this.tableId,
            username: this.username,
            instance: this.instance,
            producerType,
            producerId,
          },
          data: {
            effect: effect,
            blockStateChange: false,
          },
        });
      }
    } else if (
      (producerType === "audio" && this.permissions.acceptsAudioEffects) ||
      (producerType === "screenAudio" &&
        this.permissions.acceptsScreenAudioEffects)
    ) {
      this.mediasoupSocket.current?.sendMessage({
        type: "requestEffectChange",
        header: {
          tableId: this.tableId,
          requestedUsername: this.username,
          requestedInstance: this.instance,
          requestedProducerType: producerType,
          requestedProducerId: producerId,
        },
        data: {
          effect: effect,
          blockStateChange: false,
        },
      });
    }
  };

  onNewConsumerWasCreated = (event: onNewConsumerWasCreatedType) => {
    const { producerUsername, producerInstance, producerType, producerId } =
      event.header;

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
              .camera?.[producerId].track;
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
              .screen?.[producerId]?.track;
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
              .screenAudio?.[producerId]?.track;
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
        this.remoteMedia.current[producerUsername][producerInstance].audio
          ?.track;
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

    const { producerType, producerId } = event.header;

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
      event.header;

    if (
      producerUsername === this.username &&
      producerInstance === this.instance
    ) {
      if (producerType === "camera" && producerId) {
        this.setCameraStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[producerId];
          return newStreams;
        });
      } else if (producerType === "screen" && producerId) {
        this.setScreenStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[producerId];
          return newStreams;
        });
      } else if (producerType === "screenAudio" && producerId) {
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

  onClientMuteChange = (event: onClientMuteChangeType) => {
    if (this.isUser) {
      return;
    }
    const { clientMute } = event.data;
    const { producerType, producerId } = event.header;
    if (producerType === "audio") {
      this.clientMute.current = clientMute;
    } else {
      if (producerId) {
        this.screenAudioClientMute.current[producerId] = clientMute;
      }
    }
  };

  onLocalMuteChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => {
    if (producerType === "audio") {
      if (this.clientMute.current) {
        return;
      }

      this.localMute.current = !this.localMute.current;

      if (!this.isUser && this.audioRef.current) {
        this.audioRef.current.muted = this.localMute.current;
      }
    } else {
      if (!producerId || this.screenAudioClientMute.current[producerId]) {
        return;
      }

      this.screenAudioLocalMute.current[producerId] =
        !this.screenAudioLocalMute.current[producerId];

      const audioElement = document.getElementById(
        producerId,
      ) as HTMLAudioElement | null;
      if (!this.isUser && audioElement) {
        audioElement.muted = this.localMute.current;
      }
    }
  };

  onPermissionsResponsed = (event: onPermissionsResponsedType) => {
    const { inquiredUsername, inquiredInstance } = event.header;
    const { permissions } = event.data;

    if (
      this.username !== inquiredUsername &&
      this.instance !== inquiredInstance
    ) {
      return;
    }

    this.setPermissions(permissions);
  };

  onBundleMetadataResponsed = (event: onBundleMetadataResponsedType) => {
    const { inquiredUsername, inquiredInstance } = event.header;
    const { clientMute, streamEffects, userEffectsStyles } = event.data;

    if (
      this.username !== inquiredUsername ||
      this.instance !== inquiredInstance
    ) {
      return;
    }

    if (!this.isUser) {
      this.clientMute.current = clientMute;
    }

    this.remoteEffects.current[inquiredUsername][inquiredInstance] =
      streamEffects;

    this.remoteEffectsStyles.current[inquiredUsername][inquiredInstance] =
      userEffectsStyles;
  };

  onEffectChangeRequested = (event: onEffectChangeRequestedType) => {
    const { requestedProducerType, requestedProducerId } = event.header;
    const { effect } = event.data;

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
        effect,
      );
    }
  };

  onClientEffectChanged = (event: onClientEffectChangedType) => {
    const { username, instance, producerType, producerId } = event.header;
    const { blockStateChange, effect } = event.data;

    if (
      !this.isUser &&
      this.username === username &&
      this.instance === instance &&
      producerType === "audio"
    ) {
      if (!blockStateChange) {
        // @ts-expect-error: effect and producerType have no strict correlation enforcement
        this.remoteEffects.current[username][instance].audio[effect] = // @ts-expect-error: effect and producerType have no strict correlation enforcement
          !this.remoteEffects.current[username][instance].audio[effect];
      }
    } else if (
      !this.isUser &&
      this.username === username &&
      this.instance === instance &&
      producerType === "screenAudio" &&
      producerId
    ) {
      if (!blockStateChange) {
        this.remoteEffects.current[username][instance].screenAudio[producerId] =
          {
            ...structuredClone(defaultAudioEffects),
            [effect]:
              // @ts-expect-error: effect and producerType have no strict correlation enforcement
              !this.remoteEffects.current[username][instance].screenAudio[
                producerId
              ][effect],
          };
      }
    }
  };
}

export default BundleSocket;
