import { Settings } from "./typeConstant";

class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor(
    private noiseThreshold: number,
    private updateMovingY: (volumeLevel: number) => void,
    private audioStream: MediaStream | undefined,
    private localMute: React.MutableRefObject<boolean>,
    private clientMute: React.MutableRefObject<boolean>,
    private settings: Settings
  ) {
    this.initAudio();
  }

  destructor = () => {
    if (!this.audioContext) {
      return;
    }
    this.audioContext.close();
    this.audioContext = null;
  };

  // Update audio levels
  updateAudioLevels = (
    analyser: AnalyserNode | null,
    updateMovingY: (volumeLevel: number) => void
  ) => {
    if (analyser === null) return;

    if (
      (!this.localMute.current && !this.clientMute.current) ||
      this.settings.muteStyle.value === "smile" ||
      this.settings.muteStyle.value === "morse"
    ) {
      // Create a buffer for frequency data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Get the maximum value in the frequency data array
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const meanVolume = sum / dataArray.length;

      // Do something with the current volume
      const normalizedVolume = meanVolume / 100;

      updateMovingY(
        normalizedVolume < this.noiseThreshold
          ? 0
          : Math.min(normalizedVolume, 1)
      );
    }

    // Call this function again on the next animation frame
    requestAnimationFrame(() =>
      this.updateAudioLevels(analyser, updateMovingY)
    );
  };

  initAudio = () => {
    try {
      const stream = this.audioStream;

      if (!stream) {
        return;
      }

      // Create audio context
      this.audioContext = new AudioContext();

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      // Connect the audio stream to the analyser node
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      // Start updating audio levels
      this.updateAudioLevels(this.analyser, this.updateMovingY);
    } catch (err) {
      console.error("Error accessing audio stream:", err);
    }
  };
}

export default AudioAnalyzer;
