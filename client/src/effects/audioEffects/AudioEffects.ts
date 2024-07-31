import * as Tone from "tone";

class AudioEffects {
  private audioStream: Tone.UserMedia;

  private reverb: Tone.Reverb | undefined;
  private chorus: Tone.Chorus | undefined;
  private eq3: Tone.EQ3 | undefined;
  private delay: Tone.FeedbackDelay | undefined;
  private distortion: Tone.Distortion | undefined;
  private pitchShift: Tone.PitchShift | undefined;
  private phaser: Tone.Phaser | undefined;

  constructor(audioStream: Tone.UserMedia) {
    this.audioStream = audioStream;
  }

  applyReverbEffect() {
    this.reverb = new Tone.Reverb({
      decay: 2, // decay time (0 - 10) seconds
      preDelay: 0.05, // pre-delay time (0 - 0.1) seconds
    }).toDestination();
    this.audioStream.connect(this.reverb);
  }

  applyChorusEffect() {
    this.chorus = new Tone.Chorus({
      frequency: 1.5, // frequency of modulation (0 - 5) Hz
      delayTime: 3.5, // delay time (0 - 20) ms
      depth: 0.7, // depth of the modulation (0 - 1) %
    }).toDestination();
    this.audioStream.connect(this.chorus);
  }

  applyEQEffect() {
    this.eq3 = new Tone.EQ3({
      low: -10, // gain of low frequencies (-24 - 24) dB
      mid: 0, // gain of mid frequencies (-24 - 24) dB
      high: -5, // gain of high frequencies (-24 - 24) dB
    }).toDestination();
    this.audioStream.connect(this.eq3);
  }

  applyDelayEffect() {
    this.delay = new Tone.FeedbackDelay({
      delayTime: 0.5, // delay time (0 - 4) seconds
      feedback: 0.5, // amount of feedback (0 - 1) %
    }).toDestination();
    this.audioStream.connect(this.delay);
  }

  applyDistortionEffect() {
    this.distortion = new Tone.Distortion({
      distortion: 0.4, // amount of distortion (0 - 1) %
      oversample: "4x", // oversampling (2x - 4x)
    }).toDestination();
    this.audioStream.connect(this.distortion);
  }

  applyPitchShiftEffect() {
    this.pitchShift = new Tone.PitchShift({
      pitch: 2, // pitch shift (-12 - 12) semitones
    }).toDestination();
    this.audioStream.connect(this.pitchShift);
  }

  applyPhaserEffect() {
    this.phaser = new Tone.Phaser({
      frequency: 0.5, // frequency of the modulation (0 - 10) Hz
      octaves: 3, // number of octaves the phase goes through (0 - 8) octaves
      baseFrequency: 350, // base frequency of the filter (0 - 1000) Hz
    }).toDestination();
    this.audioStream.connect(this.phaser);
  }
}

export default AudioEffects;
