import * as Tone from "tone";

class FgSoundEffects {
  private volumeNode: Tone.Volume;
  players: { [key: number]: { player: Tone.Player; url: string } } = {};

  constructor(
    private soundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode,
    private soundEffectsChain: Tone.Gain
  ) {
    this.volumeNode = new Tone.Volume(0); // 0 dB by default

    // Set up the initial connections
    this.volumeNode.connect(this.soundEffectsChain); // Connect volumeNode to the sound effects chain
    this.soundEffectsChain.connect(this.soundEffectsMediaStreamDestination); // Connect sound effects chain to mediaStreamDestination
  }

  // Initialize a sound effect player for each sound effect
  loadSoundEffect = (key: number, url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const player = new Tone.Player(url, () => {
          resolve(); // Resolve the promise once the sound is loaded
        });

        player.connect(this.volumeNode);
        this.players[key] = { player, url };
      } catch (error) {
        console.error(`Failed to load sound effect ${key}:`, error);
        reject(error); // Reject the promise if there's an error
      }
    });
  };

  // Swap the sound effect URL for a given key
  swapPlayer = (key: number, url: string) => {
    const existingPlayerData = this.players[key];

    if (existingPlayerData) {
      // Stop the existing player if it’s playing
      existingPlayerData.player.stop();

      // Disconnect and dispose of the existing player
      existingPlayerData.player.disconnect();
      existingPlayerData.player.dispose();

      delete this.players[key];
    }

    // Create a new player with the updated URL
    const newPlayer = new Tone.Player(url).toDestination();
    newPlayer.connect(this.volumeNode);

    // Update the player entry with the new player and URL
    this.players[key] = { player: newPlayer, url };
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

  // Play or stop a sound effect based on the current state
  toggleAudio = (key: number, playing: boolean) => {
    if (!this.players[key].player) return;

    if (!this.players[key].player.loaded) {
      console.warn(`Sound effect ${key} is not loaded yet.`);
      return; // Exit if not loaded
    }

    if (playing) {
      if (this.players[key].player.state === "started") {
        this.players[key].player.stop();
      }
    } else {
      if (this.players[key].player.state !== "started") {
        this.players[key].player.start();
      }
    }
  };
}

export default FgSoundEffects;
