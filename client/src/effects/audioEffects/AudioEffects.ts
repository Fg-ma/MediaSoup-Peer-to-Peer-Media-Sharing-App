import * as Tone from "tone";

export type AudioMixEffectsType =
  | "autoFilter"
  | "autoPanner"
  | "autoWah"
  | "bitCrusher"
  | "chebyshev"
  | "chorus"
  | "distortion"
  | "EQ"
  | "feedbackDelay"
  | "freeverb"
  | "JCReverb"
  | "phaser"
  | "pingPongDelay"
  | "pitchShift"
  | "reverb"
  | "stereoWidener"
  | "tremolo"
  | "vibrato";

type AutoFilterOptionsType = "frequency" | "baseFrequency" | "octaves";
type AutoPannerOptionsType = "frequency";
type AutoWahOptionsType = "baseFrequency" | "octaves" | "sensitivity";
type BitCrusher = "bits";
type Chebyshev = "order";
type ChorusOptionsType = "frequency" | "delayTime" | "depth";
type DistortionOptionsType = "distortion" | "oversample";
type EQOptionsType = "high" | "mid" | "low";
type FeedbackDelayOptionsType = "delayTime" | "feedback";
type FreeverbOptionsType = "roomSize" | "dampening";
type JCReverbOptionsType = "roomSize";
type PhaserOptionsType = "frequency" | "octaves" | "baseFrequency";
type PingPongDelayOptionsType = "delayTime" | "feedback";
type PitchShiftOptionsType = "pitch";
type ReverbOptionsType = "decay" | "preDelay";
type StereoWidenerOptionsType = "width";
type TremoloOptionsType = "frequency" | "depth";
type VibratoOptionsType = "frequency" | "depth";

export type MixEffectsOptionsType =
  | AutoFilterOptionsType
  | AutoPannerOptionsType
  | AutoWahOptionsType
  | BitCrusher
  | Chebyshev
  | ChorusOptionsType
  | DistortionOptionsType
  | EQOptionsType
  | FeedbackDelayOptionsType
  | FreeverbOptionsType
  | JCReverbOptionsType
  | PhaserOptionsType
  | PingPongDelayOptionsType
  | PitchShiftOptionsType
  | ReverbOptionsType
  | StereoWidenerOptionsType
  | TremoloOptionsType
  | VibratoOptionsType;

const samplers = {
  basePiano: {
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3",
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  },
  brokenCassettePiano: {
    urls: {
      A0: "A0.wav",
      C1: "C1.wav",
      "D#1": "D#1.wav",
      "F#1": "F#1.wav",
      A1: "A1.wav",
      C2: "C2.wav",
      "D#2": "D#2.wav",
      "F#2": "F#2.wav",
      A2: "A2.wav",
      C3: "C3.wav",
      "D#3": "D#3.wav",
      "F#3": "F#3.wav",
      A3: "A3.wav",
      C4: "C4.wav",
      "D#4": "D#4.wav",
      "F#4": "F#4.wav",
      A4: "A4.wav",
      C5: "C5.wav",
      "D#5": "D#5.wav",
      "F#5": "F#5.wav",
      A5: "A5.wav",
      C6: "C6.wav",
      "D#6": "D#6.wav",
      "F#6": "F#6.wav",
      A6: "A6.wav",
      "A#6": "A#6.wav",
      B6: "B6.wav",
    },
    release: 1,
    baseUrl: "/audioSamples/brokenCassettePiano/",
  },
  softSteinway: {
    urls: {
      C0: "C0.wav",
      G0: "G0.wav",
      D1: "D1.wav",
      A1: "A1.wav",
      E2: "E2.wav",
      B2: "B2.wav",
      "F#3": "F#3.wav",
      "C#4": "C#4.wav",
      "G#4": "G#4.wav",
      "D#5": "D#5.wav",
      "A#5": "A#5.wav",
      F6: "F6.wav",
    },
    release: 1,
    baseUrl: "/audioSamples/softSteinway/",
  },
  dragonMagicOldPiano: {
    urls: {
      C0: "C0.wav",
      G0: "G0.wav",
      C1: "C0.wav",
      G1: "G0.wav",
      C2: "C0.wav",
      G2: "G0.wav",
      C3: "C0.wav",
      G3: "G0.wav",
      C4: "C0.wav",
      G4: "G0.wav",
      C5: "C0.wav",
      G5: "G0.wav",
      C6: "C0.wav",
      G6: "G0.wav",
    },
    release: 1,
    baseUrl: "/audioSamples/dragonMagicOldPiano/",
  },
};

class AudioEffects {
  private audioStream: Tone.UserMedia;
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  private sampler: Tone.Sampler | undefined;
  private playingNotes: Set<string> = new Set();

  private autoFilter: Tone.AutoFilter | undefined;
  private autoPanner: Tone.AutoPanner | undefined;
  private autoWah: Tone.AutoWah | undefined;
  private bitCrusher: Tone.BitCrusher | undefined;
  private chebyshev: Tone.Chebyshev | undefined;
  private chorus: Tone.Chorus | undefined;
  private distortion: Tone.Distortion | undefined;
  private eq3: Tone.EQ3 | undefined;
  private feedbackDelay: Tone.FeedbackDelay | undefined;
  private freeverb: Tone.Freeverb | undefined;
  private JCReverb: Tone.JCReverb | undefined;
  private phaser: Tone.Phaser | undefined;
  private pingPongDelay: Tone.PingPongDelay | undefined;
  private pitchShift: Tone.PitchShift | undefined;
  private reverb: Tone.Reverb | undefined;
  private stereoWidener: Tone.StereoWidener | undefined;
  private tremolo: Tone.Tremolo | undefined;
  private vibrato: Tone.Vibrato | undefined;

  private effectUpdaters: {
    [key in AudioMixEffectsType]: (
      updates: { option: MixEffectsOptionsType; value: number }[]
    ) => void;
  } = {
    autoFilter: (updates) => {
      if (!this.autoFilter) {
        this.applyAutoFilter();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.autoFilter!.frequency.value = update.value;
            break;
          case "baseFrequency":
            this.autoFilter!.baseFrequency = update.value;
            break;
          case "octaves":
            this.autoFilter!.octaves = update.value;
            break;
          default:
            break;
        }
      });
    },
    autoPanner: (updates) => {
      if (!this.autoPanner) {
        this.applyAutoPanner();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.autoPanner!.frequency.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    autoWah: (updates) => {
      if (!this.autoWah) {
        this.applyAutoWah();
      }

      updates.map((update) => {
        switch (update.option) {
          case "baseFrequency":
            this.autoWah!.baseFrequency = update.value;
            break;
          case "octaves":
            this.autoWah!.octaves = update.value;
            break;
          case "sensitivity":
            this.autoWah!.sensitivity = update.value;
            break;
          default:
            break;
        }
      });
    },
    bitCrusher: (updates) => {
      if (!this.bitCrusher) {
        this.applyBitCrusher();
      }

      updates.map((update) => {
        switch (update.option) {
          case "bits":
            this.bitCrusher!.bits.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    chebyshev: (updates) => {
      if (!this.chebyshev) {
        this.applyChebyshev();
      }

      updates.map((update) => {
        switch (update.option) {
          case "order":
            this.chebyshev!.order = update.value;
            break;
          default:
            break;
        }
      });
    },
    chorus: (updates) => {
      if (!this.chorus) {
        this.applyChorus();
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
    distortion: (updates) => {
      if (!this.distortion) {
        this.applyDistortion();
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
    EQ: (updates) => {
      if (!this.eq3) {
        this.applyEQ();
      }

      updates.map((update) => {
        switch (update.option) {
          case "low":
            this.eq3!.low.value = update.value;
            break;
          case "mid":
            this.eq3!.mid.value = update.value;
            break;
          case "high":
            this.eq3!.high.value = update.value;
            break;
        }
      });
    },
    feedbackDelay: (updates) => {
      if (!this.feedbackDelay) {
        this.applyFeedbackDelay();
      }

      updates.map((update) => {
        switch (update.option) {
          case "delayTime":
            this.feedbackDelay!.delayTime.value = update.value;
            break;
          case "feedback":
            this.feedbackDelay!.feedback.value = update.value;
            break;
        }
      });
    },
    freeverb: (updates) => {
      if (!this.freeverb) {
        this.applyFreeverb();
      }

      updates.map((update) => {
        switch (update.option) {
          case "roomSize":
            this.freeverb!.roomSize.value = update.value;
            break;
          case "dampening":
            this.freeverb!.dampening = update.value;
            break;
          default:
            break;
        }
      });
    },
    JCReverb: (updates) => {
      if (!this.JCReverb) {
        this.applyJCReverb();
      }

      updates.map((update) => {
        switch (update.option) {
          case "roomSize":
            this.JCReverb!.roomSize.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    phaser: (updates) => {
      if (!this.phaser) {
        this.applyPhaser();
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
    pingPongDelay: (updates) => {
      if (!this.pingPongDelay) {
        this.applyPingPongDelay();
      }

      updates.map((update) => {
        switch (update.option) {
          case "delayTime":
            this.pingPongDelay!.delayTime.value = update.value;
            break;
          case "feedback":
            this.pingPongDelay!.feedback.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    pitchShift: (updates) => {
      if (!this.pitchShift) {
        this.applyPitchShift();
      }

      updates.map((update) => {
        switch (update.option) {
          case "pitch":
            this.pitchShift!.pitch = update.value;
            break;
        }
      });
    },
    reverb: (updates) => {
      if (!this.reverb) {
        this.applyReverb();
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
    stereoWidener: (updates) => {
      if (!this.stereoWidener) {
        this.applyStereoWidener();
      }

      updates.map((update) => {
        switch (update.option) {
          case "width":
            this.stereoWidener!.width.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    tremolo: (updates) => {
      if (!this.tremolo) {
        this.applyTremolo();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.tremolo!.frequency.value = update.value;
            break;
          case "depth":
            this.tremolo!.depth.value = update.value;
            break;
          default:
            break;
        }
      });
    },
    vibrato: (updates) => {
      if (!this.vibrato) {
        this.applyVibrato();
      }

      updates.map((update) => {
        switch (update.option) {
          case "frequency":
            this.vibrato!.frequency.value = update.value;
            break;
          case "depth":
            this.vibrato!.depth.value = update.value;
            break;
          default:
            break;
        }
      });
    },
  };

  constructor(
    audioStream: Tone.UserMedia,
    mediaStreamDestination: MediaStreamAudioDestinationNode
  ) {
    this.audioStream = audioStream;
    this.mediaStreamDestination = mediaStreamDestination;
  }

  updateEffects = (
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) => {
    effects.map((effect) => {
      const updater = this.effectUpdaters[effect.type];
      if (updater) {
        updater(effect.updates);
      } else {
        console.error(`Effect ${effect.type} is not supported.`);
      }
    });
  };

  removeEffects = (effects: AudioMixEffectsType[]) => {
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
        case "feedbackDelay":
          this.feedbackDelay?.disconnect();
          this.feedbackDelay?.dispose();
          this.feedbackDelay = undefined;
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
  };

  createSampler = () => {
    this.sampler = new Tone.Sampler(samplers.brokenCassettePiano);
    this.sampler.connect(this.mediaStreamDestination);
  };

  // Trigger a note when a key is pressed
  playNote = (note: string, isPress: boolean) => {
    if (isPress) {
      if (!this.playingNotes.has(note)) {
        this.sampler?.triggerAttack(note);
        this.playingNotes.add(note);
      }
    } else {
      if (this.playingNotes.has(note)) {
        this.sampler?.triggerRelease(note);
        this.playingNotes.delete(note);
      }
    }
  };

  /* 
    frequency: (0 - 10) Hz
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
  */
  private applyAutoFilter = () => {
    this.autoFilter = new Tone.AutoFilter();
    this.audioStream.connect(this.autoFilter);
    this.autoFilter.connect(this.mediaStreamDestination);
  };

  /* 
    frequency: (0 - 10) Hz
  */
  private applyAutoPanner = () => {
    this.autoPanner = new Tone.AutoPanner();
    this.audioStream.connect(this.autoPanner);
    this.autoPanner.connect(this.mediaStreamDestination);
  };

  /* 
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
    sensitivity: (-40 - 0) dB
  */
  private applyAutoWah = () => {
    this.autoWah = new Tone.AutoWah();
    this.audioStream.connect(this.autoWah);
    this.autoWah.connect(this.mediaStreamDestination);
  };

  /* 
    bits: (1 - 8) bits
  */
  private applyBitCrusher = () => {
    this.bitCrusher = new Tone.BitCrusher();
    this.audioStream.connect(this.bitCrusher);
    this.bitCrusher.connect(this.mediaStreamDestination);
  };

  /* 
    order: (1 - 100) order
  */
  private applyChebyshev = () => {
    this.chebyshev = new Tone.Chebyshev();
    this.audioStream.connect(this.chebyshev);
    this.chebyshev.connect(this.mediaStreamDestination);
  };

  /* 
    frequency: (0 - 10) Hz
    delayTime: (0 - 20) ms
    depth: (0 - 1) %
  */
  private applyChorus = () => {
    this.chorus = new Tone.Chorus();
    this.audioStream.connect(this.chorus);
    this.chorus.connect(this.mediaStreamDestination);
  };

  /* 
    distortion: (0 - 1) %
    oversample: (2, 4) x
  */
  private applyDistortion = () => {
    this.distortion = new Tone.Distortion();
    this.audioStream.connect(this.distortion);
    this.distortion.connect(this.mediaStreamDestination);
  };

  /* 
    low: (-24 - 24) dB
    mid: (-24 - 24) dB
    high: (-24 - 24) dB
  */
  private applyEQ = () => {
    this.eq3 = new Tone.EQ3();
    this.audioStream.connect(this.eq3);
    this.eq3.connect(this.mediaStreamDestination);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyFeedbackDelay = () => {
    this.feedbackDelay = new Tone.FeedbackDelay();
    this.audioStream.connect(this.feedbackDelay);
    this.feedbackDelay.connect(this.mediaStreamDestination);
  };

  /* 
    roomSize: (0 - 1) size
    dampening: (0 - 10000) Hz
  */
  private applyFreeverb = () => {
    this.freeverb = new Tone.Freeverb();
    this.audioStream.connect(this.freeverb);
    this.freeverb.connect(this.mediaStreamDestination);
  };

  /* 
    roomSize: (0 - 1) size
  */
  private applyJCReverb = () => {
    this.JCReverb = new Tone.JCReverb();
    this.audioStream.connect(this.JCReverb);
    this.JCReverb.connect(this.mediaStreamDestination);
  };

  /* 
    frequency: (0 - 10) Hz
    octaves: (0 - 8) octaves
    baseFrequency: (0 - 10000) Hz
  */
  private applyPhaser = () => {
    this.phaser = new Tone.Phaser();
    this.audioStream.connect(this.phaser);
    this.phaser.connect(this.mediaStreamDestination);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyPingPongDelay = () => {
    this.pingPongDelay = new Tone.PingPongDelay();
    this.audioStream.connect(this.pingPongDelay);
    this.pingPongDelay.connect(this.mediaStreamDestination);
  };

  /* 
    pitch: (-12 - 12) semitones
  */
  private applyPitchShift = () => {
    this.pitchShift = new Tone.PitchShift();
    this.audioStream.connect(this.pitchShift);
    this.pitchShift.connect(this.mediaStreamDestination);
  };

  /* 
    decay: (1 - 10) seconds
    preDelay: (0 - 0.1) seconds
  */
  private applyReverb = () => {
    this.reverb = new Tone.Reverb();
    this.audioStream.connect(this.reverb);
    this.reverb.connect(this.mediaStreamDestination);
  };

  /* 
    width: (0 - 1) width
  */
  private applyStereoWidener = () => {
    this.stereoWidener = new Tone.StereoWidener();
    this.audioStream.connect(this.stereoWidener);
    this.stereoWidener.connect(this.mediaStreamDestination);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyTremolo = () => {
    this.tremolo = new Tone.Tremolo();
    this.audioStream.connect(this.tremolo);
    this.tremolo.connect(this.mediaStreamDestination);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyVibrato = () => {
    this.vibrato = new Tone.Vibrato();
    this.audioStream.connect(this.vibrato);
    this.vibrato.connect(this.mediaStreamDestination);
  };
}

export default AudioEffects;
