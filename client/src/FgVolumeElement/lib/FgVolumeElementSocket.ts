class FgVolumeElementSocket {
  constructor(
    private username: string,
    private instance: string,

    private isUser: boolean,

    private audioRef: React.RefObject<HTMLAudioElement>,

    private clientMute: React.MutableRefObject<boolean>,
    private localMute: React.MutableRefObject<boolean>,
    private setActive: React.Dispatch<React.SetStateAction<boolean>>,

    private volumeState: {
      from: string;
      to: string;
    },
    private setVolumeState: React.Dispatch<
      React.SetStateAction<{
        from: string;
        to: string;
      }>
    >
  ) {}

  onClientMuteStateResponsed = (event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
  }) => {
    if (
      this.isUser ||
      (this.username !== event.producerUsername &&
        this.instance !== event.producerInstance)
    ) {
      return;
    }

    this.setActive(true);

    if (this.volumeState.to !== "off") {
      this.setVolumeState((prev) => ({ from: prev.to, to: "off" }));
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

    this.setActive(
      event.clientMute ? event.clientMute : this.localMute.current
    );

    if (!this.audioRef.current) {
      return;
    }

    const newVolume = this.audioRef.current.volume;
    let newVolumeState;
    if (event.clientMute || this.localMute.current || newVolume === 0) {
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
  };

  // Handles local mute changes from outside bundle
  onLocalMuteChange = () => {
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
  };
}

export default FgVolumeElementSocket;
