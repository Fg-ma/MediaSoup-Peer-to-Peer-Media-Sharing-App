class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  constructor(private noiseThreshold: number) {
    this.initAudio.bind(this);
  }

  destructor() {
    if (!this.audioContext) {
      return;
    }
    this.audioContext.close();
    this.audioContext = null;
  }

  // Update audio levels
  updateAudioLevels(
    analyser: AnalyserNode | null,
    updateMovingY: (volumeLevel: number) => void
  ) {
    if (analyser === null) return;

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
      normalizedVolume < this.noiseThreshold ? 0 : Math.min(normalizedVolume, 1)
    );

    // Call this function again on the next animation frame
    requestAnimationFrame(() =>
      this.updateAudioLevels(analyser, updateMovingY)
    );
  }

  initAudio(
    updateMovingY: (volumeLevel: number) => void,
    audioStream: MediaStream | undefined
  ) {
    try {
      const stream = audioStream;

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
      this.updateAudioLevels(this.analyser, updateMovingY);
    } catch (err) {
      console.error("Error accessing audio stream:", err);
    }
  }
}

export default AudioAnalyzer;
