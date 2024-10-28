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
  loadSoundEffect = (key: number, url: string) => {
    const player = new Tone.Player(url).toDestination();
    player.connect(this.volumeNode);
    this.players[key] = { player, url };
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
    const player = this.players[key].player;
    if (!player) return;

    if (playing) {
      player.stop();
    } else {
      // Check if the player's buffer is loaded
      if (!player.loaded) {
        console.warn(`Sound effect ${key} is not loaded yet.`);
        return; // Exit if not loaded
      }
      player.start();
    }
  };
}

export default FgSoundEffects;
