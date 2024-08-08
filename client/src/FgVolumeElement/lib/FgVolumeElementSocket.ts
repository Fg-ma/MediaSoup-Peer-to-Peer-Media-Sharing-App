class FgVolumeElementSocket {
  private isUser: boolean;
  private username: string;
  private clientMute: React.MutableRefObject<boolean> | undefined;
  private videoIconStateRef: React.MutableRefObject<{
    from: string;
    to: string;
  }>;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private localMute: React.MutableRefObject<boolean>;
  private setPaths: React.Dispatch<
    React.SetStateAction<[string, string, string] | undefined>
  >;
  private getPaths: (
    from: string,
    to: string
  ) => [string, string, string] | undefined;
  private setActive: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(
    isUser: boolean,
    username: string,
    clientMute: React.MutableRefObject<boolean> | undefined,
    videoIconStateRef: React.MutableRefObject<{
      from: string;
      to: string;
    }>,
    audioRef: React.RefObject<HTMLAudioElement>,
    localMute: React.MutableRefObject<boolean>,
    setPaths: React.Dispatch<
      React.SetStateAction<[string, string, string] | undefined>
    >,
    getPaths: (
      from: string,
      to: string
    ) => [string, string, string] | undefined,
    setActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.isUser = isUser;
    this.username = username;
    this.clientMute = clientMute;
    this.videoIconStateRef = videoIconStateRef;
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
      if (newPaths) {
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

    if (event.clientMute) {
      this.setActive(event.clientMute);
    } else {
      this.setActive(this.localMute.current);
    }

    if (this.clientMute) {
      this.clientMute.current = event.clientMute;
    }

    if (event.clientMute) {
      if (this.videoIconStateRef.current.to !== "off") {
        this.videoIconStateRef.current = {
          from: this.videoIconStateRef.current.to,
          to: "off",
        };
        const newPaths = this.getPaths(
          this.videoIconStateRef.current.from,
          "off"
        );
        if (newPaths) {
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
        if (newPaths) {
          this.setPaths(newPaths);
        }
      }
    }
  }

  // Handles local mute changes from outside bundle
  onLocalMuteChange() {
    this.localMute.current = !this.localMute.current;

    if (this.localMute.current) {
      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: "off",
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        "off"
      );
      if (newPaths) {
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

      this.videoIconStateRef.current = {
        from: this.videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = this.getPaths(
        this.videoIconStateRef.current.from,
        newVolumeState
      );
      if (newPaths) {
        this.setPaths(newPaths);
      }
    }
  }
}

export default FgVolumeElementSocket;
