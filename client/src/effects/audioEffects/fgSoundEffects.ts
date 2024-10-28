import * as Tone from "tone";

class FgSoundEffects {
  private volumeNode: Tone.Volume;
  players: { [key: number]: Tone.Player } = {};

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
    this.players[key] = player;
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

  // Play or stop a sound effect based on the current state
  toggleAudio = (key: number, playing: boolean) => {
    const player = this.players[key];
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

      player.onended = () => {
        onPlaybackComplete(); // Run the provided callback when playback finishes
      };
    }
  };
}

export default FgSoundEffects;
