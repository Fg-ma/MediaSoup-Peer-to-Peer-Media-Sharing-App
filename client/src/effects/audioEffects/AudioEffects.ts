import * as Tone from "tone";

export type AudioMixEffectsType =
  | "reverb"
  | "chorus"
  | "EQ"
  | "delay"
  | "distortion"
  | "pitchShift"
  | "phaser";

type ReverbOptionsType = "decay" | "preDelay";
type ChorusOptionsType = "frequency" | "delayTime" | "depth";
type EQOptionsType = "high" | "mid" | "low";
type DelayOptionsType = "delayTime" | "feedback";
type DistortionOptionsType = "distortion" | "oversample";
type PitchShiftOptionsType = "pitch";
type PhaserOptionsType = "frequency" | "octaves" | "baseFrequency";

export type MixEffectsOptionsType =
  | ReverbOptionsType
  | ChorusOptionsType
  | EQOptionsType
  | DelayOptionsType
  | DistortionOptionsType
  | PitchShiftOptionsType
  | PhaserOptionsType;

class AudioEffects {
  private audioStream: Tone.UserMedia;

  private reverb: Tone.Reverb | undefined;
  private chorus: Tone.Chorus | undefined;
  private eq3: Tone.EQ3 | undefined;
  private delay: Tone.FeedbackDelay | undefined;
  private distortion: Tone.Distortion | undefined;
  private pitchShift: Tone.PitchShift | undefined;
  private phaser: Tone.Phaser | undefined;

  private effectUpdaters: {
    [key in AudioMixEffectsType]: (
      updates: { option: MixEffectsOptionsType; value: number }[]
    ) => void;
  } = {
    reverb: (updates) => {
      if (!this.reverb) {
        this.applyReverbEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "decay":
            this.reverb!.decay = update.value;
            break;
          case "preDelay":
            this.reverb!.preDelay = update.value;
            break;
        }
      });
    },
    chorus: (updates) => {
      if (!this.chorus) {
        this.applyChorusEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.chorus!.frequency.value = update.value;
            break;
          case "delayTime":
            this.chorus!.delayTime = update.value;
            break;
          case "depth":
            this.chorus!.depth = update.value;
            break;
        }
      });
    },
    EQ: (updates) => {
      if (!this.eq3) {
        this.applyEQEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "mid":
            this.eq3!.low.value = update.value;
            break;
          case "low":
            this.eq3!.mid.value = update.value;
            break;
          case "high":
            this.eq3!.high.value = update.value;
            break;
        }
      });
    },
    delay: (updates) => {
      if (!this.delay) {
        this.applyDelayEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "delayTime":
            this.delay!.delayTime.value = update.value;
            break;
          case "feedback":
            this.delay!.feedback.value = update.value;
            break;
        }
      });
    },
    distortion: (updates) => {
      if (!this.distortion) {
        this.applyDistortionEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "distortion":
            this.distortion!.distortion = update.value;
            break;
          case "feedback":
            this.distortion!.oversample = `${update.value <= 2 ? 2 : 4}x`;
            break;
        }
      });
    },
    pitchShift: (updates) => {
      if (!this.pitchShift) {
        this.applyPitchShiftEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "pitch":
            this.pitchShift!.pitch = update.value;
            break;
        }
      });
    },
    phaser: (updates) => {
      if (!this.phaser) {
        this.applyPhaserEffect();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.phaser!.frequency.value = update.value;
            break;
          case "octaves":
            this.phaser!.octaves = update.value;
            break;
          case "baseFrequency":
            this.phaser!.baseFrequency = update.value;
            break;
        }
      });
    },
  };

  constructor(audioStream: Tone.UserMedia) {
    this.audioStream = audioStream;
  }

  updateEffects(
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) {
    effects.map((effect) => {
      const updater = this.effectUpdaters[effect.type];
      if (updater) {
        updater(effect.updates);
      } else {
        console.error(`Effect ${effect.type} is not supported.`);
      }
    });
  }

  removeEffects(effects: AudioMixEffectsType[]) {
    effects.map((effect) => {
      switch (effect) {
        case "reverb":
          this.reverb?.disconnect();
          this.reverb?.dispose();
          this.reverb = undefined;
          break;
        case "chorus":
          this.chorus?.disconnect();
          this.chorus?.dispose();
          this.chorus = undefined;
          break;
        case "EQ":
          this.eq3?.disconnect();
          this.eq3?.dispose();
          this.eq3 = undefined;
          break;
        case "delay":
          this.delay?.disconnect();
          this.delay?.dispose();
          this.delay = undefined;
          break;
        case "distortion":
          this.distortion?.disconnect();
          this.distortion?.dispose();
          this.distortion = undefined;
          break;
        case "pitchShift":
          this.pitchShift?.disconnect();
          this.pitchShift?.dispose();
          this.pitchShift = undefined;
          break;
        case "phaser":
          this.phaser?.disconnect();
          this.phaser?.dispose();
          this.phaser = undefined;
          break;
      }
    });
  }

  applyReverbEffect() {
    this.reverb = new Tone.Reverb({
      decay: 1, // decay time (1 - 10) seconds
      preDelay: 0.0, // pre-delay time (0 - 0.1) seconds
    }).toDestination();
    this.audioStream.connect(this.reverb);
  }

  applyChorusEffect() {
    this.chorus = new Tone.Chorus({
      frequency: 0, // frequency of modulation (0 - 5) Hz
      delayTime: 0, // delay time (0 - 20) ms
      depth: 0, // depth of the modulation (0 - 1) %
    }).toDestination();
    this.audioStream.connect(this.chorus);
  }

  applyEQEffect() {
    this.eq3 = new Tone.EQ3({
      low: 0, // gain of low frequencies (-24 - 24) dB
      mid: 0, // gain of mid frequencies (-24 - 24) dB
      high: 0, // gain of high frequencies (-24 - 24) dB
    }).toDestination();
    this.audioStream.connect(this.eq3);
  }

  applyDelayEffect() {
    this.delay = new Tone.FeedbackDelay({
      delayTime: 0, // delay time (0 - 1) seconds
      feedback: 0, // amount of feedback (0 - 1) %
    }).toDestination();
    this.audioStream.connect(this.delay);
  }

  applyDistortionEffect() {
    this.distortion = new Tone.Distortion({
      distortion: 0, // amount of distortion (0 - 1) %
      oversample: "2x", // oversampling (2x - 4x)
    }).toDestination();
    this.audioStream.connect(this.distortion);
  }

  applyPitchShiftEffect() {
    this.pitchShift = new Tone.PitchShift({
      pitch: 0, // pitch shift (-12 - 12) semitones
    }).toDestination();
    this.audioStream.connect(this.pitchShift);
  }

  applyPhaserEffect() {
    this.phaser = new Tone.Phaser({
      frequency: 0, // frequency of the modulation (0 - 10) Hz
      octaves: 0, // number of octaves the phase goes through (0 - 8) octaves
      baseFrequency: 0, // base frequency of the filter (0 - 1000) Hz
    }).toDestination();
    this.audioStream.connect(this.phaser);
  }
}

export default AudioEffects;
