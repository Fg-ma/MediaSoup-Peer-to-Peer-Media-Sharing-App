import * as Tone from "tone";
import { BackgroundMusicTypes } from "../context/streamEffectsContext/typeConstant";

class FgBackgroundMusic {
  private volumeNode: Tone.Volume;
  players: {
    [backgroundMusicType in BackgroundMusicTypes]?: {
      player: Tone.Player;
      url: string;
    };
  } = {};
  importedPlayers: Record<
    number,
    { player: Tone.Player; file: File; path: string }
  > = {};

  constructor(
    private backgroundMusicMediaStreamDestination: MediaStreamAudioDestinationNode,
    private backgroundMusicChain: Tone.Gain
  ) {
    this.volumeNode = new Tone.Volume(0); // 0 dB by default

    // Set up the initial connections
    this.volumeNode.connect(this.backgroundMusicChain); // Connect volumeNode to the sound effects chain
    this.backgroundMusicChain.connect(
      this.backgroundMusicMediaStreamDestination
    ); // Connect sound effects chain to mediaStreamDestination
  }

  // Initialize a sound effect player for each sound effect
  loadBackgroundMusic = (
    backgroundMusicType: BackgroundMusicTypes,
    url: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const player = new Tone.Player(url, () => {
          resolve(); // Resolve the promise once the sound is loaded
        }).toDestination();

        player.connect(this.volumeNode);
        player.loop = true;
        this.players[backgroundMusicType] = { player, url };
      } catch (error) {
        console.error(
          `Failed to load sound effect ${backgroundMusicType}:`,
          error
        );
        reject(error); // Reject the promise if there's an error
      }
    });
  };

  // Play or stop a sound effect based on the current state
  toggleAudio = (
    backgroundMusicType: BackgroundMusicTypes,
    playing: boolean
  ): boolean => {
    if (!this.players[backgroundMusicType]?.player) return false;

    if (!this.players[backgroundMusicType].player.loaded) {
      console.warn(`Sound effect ${backgroundMusicType} is not loaded yet.`);
      return false; // Exit if not loaded
    }

    if (playing) {
      if (this.players[backgroundMusicType].player.state === "started") {
        this.players[backgroundMusicType].player.stop();
      }
    } else {
      if (this.players[backgroundMusicType].player.state !== "started") {
        this.players[backgroundMusicType].player.start();
      }
    }

    return true;
  };

  // Initialize a sound effect player for each sound effect
  loadImportedBackgroundMusic = (key: number, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);

        const player = new Tone.Player(url, () => {
          resolve(); // Resolve the promise once the sound is loaded
        }).toDestination();

        player.connect(this.volumeNode);
        player.loop = true;
        this.importedPlayers[key] = { player, file, path: url };
      } catch (error) {
        console.error(`Failed to load sound effect ${key}:`, error);
        reject(error); // Reject the promise if there's an error
      }
    });
  };

  toggleImportedAudio = (key: number, playing: boolean): boolean => {
    if (!this.importedPlayers[key].player) return false;

    if (!this.importedPlayers[key].player.loaded) {
      console.warn(`Sound effect ${key} is not loaded yet.`);
      return false; // Exit if not loaded
    }

    if (playing) {
      if (this.importedPlayers[key].player.state === "started") {
        this.importedPlayers[key].player.stop();
      }
    } else {
      if (this.importedPlayers[key].player.state !== "started") {
        this.importedPlayers[key].player.start();
      }
    }

    return true;
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

  toggleAllOff = () => {
    for (const player of Object.entries(this.players)) {
      if (player[1].player.state === "started") {
        player[1].player.stop();
      }
    }
  };
}

export default FgBackgroundMusic;
