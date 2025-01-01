import {
  onClientMuteChangeType,
  onClientMuteStateResponsedType,
} from "../../lib/MediasoupSocketController";

class FgVolumeElementSocket {
  constructor(
    protected username: string,
    protected instance: string,
    protected producerId: string | undefined,

    protected isUser: boolean,

    protected audioRef: React.RefObject<HTMLAudioElement>,

    protected clientMute: React.MutableRefObject<boolean>,
    protected screenAudioClientMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,
    protected localMute: React.MutableRefObject<boolean>,
    protected screenAudioLocalMute: React.MutableRefObject<{
      [screenAudioId: string]: boolean;
    }>,

    protected volumeState: {
      from: string;
      to: string;
    },
    protected setVolumeState: React.Dispatch<
      React.SetStateAction<{
        from: string;
        to: string;
      }>
    >
  ) {}

  onClientMuteStateResponsed = (event: onClientMuteStateResponsedType) => {
    const { producerUsername, producerInstance } = event.header;

    if (
      this.isUser ||
      (this.username !== producerUsername && this.instance !== producerInstance)
    ) {
      return;
    }

    if (this.volumeState.to !== "off") {
      this.setVolumeState((prev) => ({ from: prev.to, to: "off" }));
    }
  };

  // Get client mute changes from other users
  onClientMuteChange = (event: onClientMuteChangeType) => {
    const { username, instance, producerType, producerId } = event.header;
    const { clientMute } = event.data;

    if (
      this.isUser ||
      username !== this.username ||
      instance !== this.instance ||
      producerId !== this.producerId
    ) {
      return;
    }

    if (producerType === "audio") {
      if (!this.audioRef.current) {
        return;
      }

      const newVolume = this.audioRef.current.volume;
      let newVolumeState;
      if (clientMute || this.localMute.current || newVolume === 0) {
        newVolumeState = "off";
      } else if (this.audioRef.current.volume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      this.audioRef.current.muted = newVolumeState === "off";

      this.setVolumeState((prev) => {
        if (prev.to !== newVolumeState) {
          return {
            from: prev.to,
            to: newVolumeState,
          };
        } else {
          return prev;
        }
      });
    } else {
      if (!producerId) return;

      const audioElement = document.getElementById(
        producerId
      ) as HTMLAudioElement | null;

      if (!audioElement) {
        return;
      }

      const newVolume = audioElement.volume;
      let newVolumeState;
      if (
        clientMute ||
        this.screenAudioLocalMute.current[producerId] ||
        newVolume === 0
      ) {
        newVolumeState = "off";
      } else if (audioElement.volume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }
      audioElement.muted = newVolumeState === "off";

      this.setVolumeState((prev) => {
        if (prev.to !== newVolumeState) {
          return {
            from: prev.to,
            to: newVolumeState,
          };
        } else {
          return prev;
        }
      });
    }
  };

  // Handles local mute changes from outside bundle
  onLocalMuteChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => {
    if (producerType === "audio") {
      if (this.clientMute.current) {
        return;
      }

      let newVolumeState;
      if (this.localMute.current) {
        newVolumeState = "off";
      } else {
        newVolumeState = "high";
      }

      if (newVolumeState !== this.volumeState.to) {
        this.setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
      }
    } else {
      if (!producerId || this.screenAudioClientMute.current[producerId]) {
        return;
      }

      let newVolumeState;
      if (this.screenAudioLocalMute.current[producerId]) {
        newVolumeState = "off";
      } else {
        newVolumeState = "high";
      }

      if (newVolumeState !== this.volumeState.to) {
        this.setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
      }
    }
  };
}

export default FgVolumeElementSocket;
