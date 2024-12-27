import { Player, Volume, getTransport, ToneAudioNode, Gain } from "tone";
import { TransportClass } from "tone/build/esm/core/clock/Transport";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const metronomeUrl = nginxAssetSeverBaseUrl + "audioSamples/metronome.wav";

class FgMetronome {
  private metronome: Player;
  private bpm: number = 120;

  private transport: TransportClass;

  private volumeNode: Volume;

  constructor() {
    this.metronome = new Player({
      url: metronomeUrl,
      loop: false, // Ensure the player does not loop
    });

    this.volumeNode = new Volume(1);
    this.metronome.connect(this.volumeNode);
    this.volumeNode.toDestination();

    // Use getTransport to get the transport object
    this.transport = getTransport();

    // Set up the transport with a repeating event
    this.transport.scheduleRepeat((time: number) => {
      this.metronome.start(time);
    }, "4n"); // Repeat every quarter note
  }

  connect(destination: ToneAudioNode | Gain) {
    this.metronome.connect(this.volumeNode);
    this.volumeNode.connect(destination);
  }

  setVolume(volume: number) {
    this.volumeNode.volume.value = volume; // Control metronome volume
  }

  startMetronome = () => {
    if (this.metronome.loaded) {
      this.transport.start();
      return true;
    } else {
      return false;
    }
  };

  stopMetronome = () => {
    if (this.metronome.loaded) {
      this.transport.stop();
      return true;
    } else {
      return false;
    }
  };

  setMetronomeBPM = (bpm: number) => {
    this.bpm = bpm;

    this.transport.bpm.value = this.bpm; // Set BPM
  };

  // Set volume (in decibels)
  setMetronomeVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };
}

export default FgMetronome;
