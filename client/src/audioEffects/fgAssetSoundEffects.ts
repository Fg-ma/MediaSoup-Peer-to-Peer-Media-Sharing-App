import { Volume, Player, Gain } from "tone";

class FgAssetSoundEffects {
  private volumeNode: Volume;
  players: { [url: string]: Player } = {};

  constructor(
    private assetSoundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode,
    private assetSoundEffectsChain: Gain
  ) {
    this.volumeNode = new Volume(0); // 0 dB by default

    // Set up the initial connections
    this.volumeNode.connect(this.assetSoundEffectsChain); // Connect volumeNode to the sound effects chain
    this.assetSoundEffectsChain.connect(
      this.assetSoundEffectsMediaStreamDestination
    ); // Connect sound effects chain to mediaStreamDestination
  }

  // Initialize a sound effect player for each sound effect
  loadAssetSoundEffect = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const player = new Player(url, () => {
          resolve(); // Resolve the promise once the sound is loaded
        }).toDestination();

        player.connect(this.volumeNode);
        this.players[url] = player;
      } catch (error) {
        console.error(`Failed to load sound effect ${url}:`, error);
        reject(error); // Reject the promise if there's an error
      }
    });
  };

  // Swap the sound effect URL for a given key
  swapPlayer = (url: string) => {
    const existingPlayerData = this.players[url];

    if (existingPlayerData) {
      // Stop the existing player if it’s playing
      existingPlayerData.stop();

      // Disconnect and dispose of the existing player
      existingPlayerData.disconnect();
      existingPlayerData.dispose();

      delete this.players[url];
    }

    // Create a new player with the updated URL
    const newPlayer = new Player(url).toDestination();
    newPlayer.connect(this.volumeNode);

    // Update the player entry with the new player and URL
    this.players[url] = newPlayer;
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

  // Play or stop a sound effect based on the current state
  toggleAudio = async (url: string): Promise<boolean> => {
    if (!this.players[url] || !this.players[url].loaded) {
      await this.loadAssetSoundEffect(url);
    }

    if (this.players[url].state === "started") {
      this.players[url].stop();
    } else {
      this.players[url].start();
    }

    return true;
  };
}

export default FgAssetSoundEffects;
