class FgVolumeElementSocket {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean> | undefined;
  private videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  private isFinishedRef: React.MutableRefObject<boolean>;
  private changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMute: React.MutableRefObject<boolean>;
  private setPaths: React.Dispatch<React.SetStateAction<string[][]>>;
  private getPaths: (from: string, to: string) => string[][];
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean> | undefined,
    videoIconStateRef: React.MutableRefObject<{
      from: string;
      to: string;
    }>,
    isFinishedRef: React.MutableRefObject<boolean>,
    changedWhileNotFinishedRef: React.MutableRefObject<boolean>,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMute: React.MutableRefObject<boolean>,
    setPaths: React.Dispatch<React.SetStateAction<string[][]>>,
    getPaths: (from: string, to: string) => string[][],
    setActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.videoIconStateRef = videoIconStateRef;
    this.isFinishedRef = isFinishedRef;
    this.changedWhileNotFinishedRef = changedWhileNotFinishedRef;
    this.audioRef = audioRef;
    this.localMute = localMute;
    this.setPaths = setPaths;
    this.getPaths = getPaths;
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

    if (this.clientMute) {
      this.clientMute.current = true;
    }

    if (this.videoIconStateRef.current.to !== "off") {
      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: "off",
      };
      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        "off"
      );
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    }
  }

  // Get client mute changes from other users
  onClientMuteChange(event: {
    type: string;
    username: string;
    clientMute: boolean;
  }) {
    if (this.isUser || this.username !== event.username) {
      return;
    }

    this.setActive(event.clientMute);

    if (this.clientMute) {
      this.clientMute.current = event.clientMute;
    }

    if (event.clientMute) {
      if (!this.isFinishedRef.current) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      if (this.videoIconStateRef.current.to !== "off") {
        this.videoIconStateRef.current = {
          from: this.videoIconStateRef.current.to,
          to: "off",
        };
        const newPaths = this.getPaths(
          this.videoIconStateRef.current.from,
          "off"
        );
        if (newPaths[0]) {
          this.setPaths(newPaths);
        }
      }
    } else {
      if (!this.audioRef.current) {
        return;
      }

      const newVolume = this.audioRef.current.volume;
      let newVolumeState;
      if (newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (
        !this.isFinishedRef.current &&
        this.videoIconStateRef.current.to !== newVolumeState
      ) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      if (
        newVolumeState !== this.videoIconStateRef.current.to &&
        !this.audioRef.current.muted
      ) {
        this.videoIconStateRef.current = {
          from: this.videoIconStateRef.current.to,
          to: newVolumeState,
        };

        const newPaths = this.getPaths(
          this.videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths[0]) {
          this.setPaths(newPaths);
        }
      }
    }
  }

  // Handles local mute changes from outside bundle
  onLocalMuteChange() {
    this.localMute.current = !this.localMute.current;

    if (this.localMute.current) {
      if (!this.isFinishedRef.current) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: "off",
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        "off"
      );
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    } else {
      if (!this.audioRef.current) {
        return;
      }

      const newVolume = this.audioRef.current.volume;
      let newVolumeState;
      if (newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (
        !this.isFinishedRef.current &&
        this.videoIconStateRef.current.to !== newVolumeState
      ) {
        if (!this.changedWhileNotFinishedRef.current) {
          this.changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        newVolumeState
      );
      if (newPaths[0]) {
        this.setPaths(newPaths);
      }
    }
  }
}

export default FgVolumeElementSocket;
