import * as Tone from "tone";
import { BackgroundMusicTypes } from "../context/currentEffectsStylesContext/typeConstant";

class FgBackgroundMusic {
  private volumeNode: Tone.Volume;
  players: {
    [backgroundMusicType in BackgroundMusicTypes]?: {
      player: Tone.Player;
      url: string;
    };
  } = {};

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

  // Swap the sound effect URL for a given key
  swapPlayer = (backgroundMusicType: BackgroundMusicTypes, url: string) => {
    const existingPlayerData = this.players[backgroundMusicType];

    if (existingPlayerData) {
      // Stop the existing player if it’s playing
      existingPlayerData.player.stop();

      // Disconnect and dispose of the existing player
      existingPlayerData.player.disconnect();
      existingPlayerData.player.dispose();

      delete this.players[backgroundMusicType];
    }

    // Create a new player with the updated URL
    const newPlayer = new Tone.Player(url).toDestination();
    newPlayer.loop = true;
    newPlayer.connect(this.volumeNode);

    // Update the player entry with the new player and URL
    this.players[backgroundMusicType] = { player: newPlayer, url };
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
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
}

export default FgBackgroundMusic;
