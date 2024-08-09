class FgVolumeElementSocket {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean>;
  private volumeState: {
    from: string;
    to: string;
  };
  private setVolumeState: React.Dispatch<
    React.SetStateAction<{
      from: string;
      to: string;
    }>
  >;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMute: React.MutableRefObject<boolean>;
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean>,
    volumeState: {
      from: string;
      to: string;
    },
    setVolumeState: React.Dispatch<
      React.SetStateAction<{
        from: string;
        to: string;
      }>
    >,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMute: React.MutableRefObject<boolean>,
    setActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.volumeState = volumeState;
    this.setVolumeState = setVolumeState;
    this.audioRef = audioRef;
    this.localMute = localMute;
    this.setActive = setActive;
  }

  onClientMuteStateResponsed(event: {
    type: string;
    producerUsername: string;
  }) {
    if (this.isUser || this.username !== event.producerUsername) {
      return;
    }

    this.setActive(true);

    this.clientMute.current = true;

    if (this.volumeState.to !== "off") {
      this.setVolumeState((prev) => ({ from: prev.to, to: "off" }));
    }
  }

  // Get client mute changes from other users
  onClientMuteChange(event: {
    type: string;
    username: string;
    clientMute: boolean;
  }) {
    if (this.isUser) {
      return;
    }

    this.setActive(
      event.clientMute ? event.clientMute : this.localMute.current
    );

    this.clientMute.current = event.clientMute;

    if (!this.audioRef.current) {
      return;
    }

    const newVolume = this.audioRef.current.volume;
    let newVolumeState;
    if (event.clientMute || newVolume === 0) {
      newVolumeState = "off";
    } else if (this.audioRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    this.audioRef.current.muted = newVolumeState === "off";

    this.setVolumeState((prev) => ({
      from: prev.to,
      to: newVolumeState,
    }));
  }

  // Handles local mute changes from outside bundle
  onLocalMuteChange() {
    if (this.clientMute.current) {
      return;
    }

    this.localMute.current = !this.localMute.current;

    if (!this.audioRef.current) {
      return;
    }

    if (!this.isUser) {
      this.audioRef.current.muted = this.localMute.current;
    }

    const newVolume = this.audioRef.current.volume;
    let newVolumeState;
    if (this.localMute.current || newVolume === 0) {
      newVolumeState = "off";
    } else if (newVolume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    this.setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
  }
}

export default FgVolumeElementSocket;
