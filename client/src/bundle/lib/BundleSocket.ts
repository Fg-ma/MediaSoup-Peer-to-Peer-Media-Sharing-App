import {
  AudioEffectTypes,
  RemoteStreamEffectsType,
  RemoteTracksMapType,
  UserMediaType,
} from "../../context/streamsContext/typeConstant";
import { EffectStylesType } from "../../context/currentEffectsStylesContext/typeConstant";
import { Permissions } from "../../context/permissionsContext/PermissionsContext";
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
    private remoteTracksMap: React.MutableRefObject<RemoteTracksMapType>,
    private remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>,
    private remoteCurrentEffectsStyles: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: EffectStylesType;
      };
    }>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private audioRef: React.RefObject<HTMLAudioElement>,
    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private permissions: Permissions,
    private setPermissions: React.Dispatch<React.SetStateAction<Permissions>>,
    private handleAudioEffectChange: (effect: AudioEffectTypes) => void,
    private onNewConsumerWasCreatedCallback?: () => void
  ) {}

  onNewConsumerWasCreated = (event: onNewConsumerWasCreatedType) => {
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
    } else if (event.consumerType === "screenAudio") {
      // Create AudioContext and AnalyserNode
      const audioContext = new AudioContext();
      const thimg =
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].screenAudio;
      const stream = new MediaStream([
        ...(event.consumerId && thimg ? [thimg[event.consumerId]] : []),
      ]);
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      console.log(
        stream,
        this.remoteTracksMap.current[event.producerUsername][
          event.producerInstance
        ].screenAudio?.[event.consumerId ?? "asd"]
      );

      // Configure the analyser
      analyser.fftSize = 256; // Set the size of the FFT (frequency bins)
      const dataArray = new Uint8Array(analyser.frequencyBinCount); // Array to store frequency data

      // Connect the audio stream source to the analyser
      source.connect(analyser);

      // Function to log audio volume
      function logAudioVolume() {
        analyser.getByteFrequencyData(dataArray); // Get the frequency data
        const averageVolume =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        console.log(`Audio Volume: ${averageVolume}`);

        // Schedule next log
        requestAnimationFrame(logAudioVolume);
      }

      // Start logging the audio volume
      logAudioVolume();
      this.setScreenAudioStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            this.remoteTracksMap.current[event.producerUsername][
              event.producerInstance
            ].screenAudio?.[event.consumerId];
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

    this.remoteCurrentEffectsStyles.current[event.inquiredUsername][
      event.inquiredInstance
    ] = event.data.currentEffectsStyles;
  };

  onEffectChangeRequested = (event: onEffectChangeRequestedType) => {
    if (
      this.permissions.acceptsAudioEffects &&
      event.requestedProducerType === "audio"
    ) {
      // @ts-expect-error: event.effect and event.requestedProducerType have no strict correlation enforcement
      this.handleAudioEffectChange(event.effect);
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
        ] =
          // @ts-expect-error: event.effect and event.producerType have no strict correlation enforcement
          !this.remoteStreamEffects.current[event.username][event.instance]
            .audio[event.effect];
      }
    }
  };
}

export default BundleSocket;
