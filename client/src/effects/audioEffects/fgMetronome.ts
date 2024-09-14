import * as Tone from "tone";
import metronomeUrl from "../../../public/audioSamples/metronome.wav";

class FgMetronome {
  private metronome: Tone.Player;
  private bpm: number = 120;

  private transport: ReturnType<typeof Tone.getTransport>;

  private volumeNode: Tone.Volume;

  constructor() {
    this.metronome = new Tone.Player({
      url: metronomeUrl,
      loop: false, // Ensure the player does not loop
    });

    this.volumeNode = new Tone.Volume(1);
    this.metronome.connect(this.volumeNode);
    this.volumeNode.toDestination();

    // Use getTransport to get the transport object
    this.transport = Tone.getTransport();

    // Set up the transport with a repeating event
    this.transport.scheduleRepeat((time: number) => {
      this.metronome.start(time); // Play the tick sound at each beat
    }, "4n"); // Repeat every quarter note
  }

  connect(destination: Tone.ToneAudioNode | Tone.Gain) {
    this.metronome.connect(this.volumeNode);
    this.volumeNode.connect(destination);
  }

  setVolume(volume: number) {
    this.volumeNode.volume.value = volume; // Control metronome volume
  }

  startMetronome = () => {
    this.transport.start(); // Start the transport
  };

  stopMetronome = () => {
    this.transport.stop(); // Stop the transport
  };

  setMetronomeBPM = (bpm: number) => {
    this.bpm = bpm;

    this.transport.bpm.value = bpm; // Set BPM
  };

  // Set volume (in decibels)
  setMetronomeVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };
}

export default FgMetronome;
