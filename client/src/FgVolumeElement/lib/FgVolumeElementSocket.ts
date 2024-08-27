class FgVolumeElementSocket {
  private username: string;
  private instance: string;

  private isUser: boolean;

  private audioRef: React.RefObject<HTMLAudioElement>;

  private clientMute: React.MutableRefObject<boolean>;
  private localMute: React.MutableRefObject<boolean>;
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

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

  constructor(
    username: string,
    instance: string,

    isUser: boolean,

    audioRef: React.RefObject<HTMLAudioElement>,

    clientMute: React.MutableRefObject<boolean>,
    localMute: React.MutableRefObject<boolean>,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,

    volumeState: {
      from: string;
      to: string;
    },
    setVolumeState: React.Dispatch<
      React.SetStateAction<{
        from: string;
        to: string;
      }>
    >
  ) {
    this.username = username;
    this.instance = instance;
    this.isUser = isUser;
    this.audioRef = audioRef;
    this.clientMute = clientMute;
    this.localMute = localMute;
    this.setActive = setActive;
    this.volumeState = volumeState;
    this.setVolumeState = setVolumeState;
  }

  onClientMuteStateResponsed(event: {
    type: string;
    producerUsername: string;
    producerInstance: string;
  }) {
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
