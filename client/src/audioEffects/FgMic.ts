import {
  AutoFilter,
  AutoPanner,
  AutoWah,
  BitCrusher,
  Chebyshev,
  Chorus,
  Distortion,
  EQ3,
  FeedbackDelay,
  Freeverb,
  JCReverb,
  Phaser,
  PingPongDelay,
  PitchShift,
  Reverb,
  StereoWidener,
  Tremolo,
  Vibrato,
  UserMedia,
  Gain,
} from "tone";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
  ToneEffectsType,
} from "./typeConstant";

class FgMic {
  private micEffects: ToneEffectsType[] = [];

  private autoFilter: AutoFilter | undefined;
  private autoPanner: AutoPanner | undefined;
  private autoWah: AutoWah | undefined;
  private bitCrusher: BitCrusher | undefined;
  private chebyshev: Chebyshev | undefined;
  private chorus: Chorus | undefined;
  private distortion: Distortion | undefined;
  private eq3: EQ3 | undefined;
  private feedbackDelay: FeedbackDelay | undefined;
  private freeverb: Freeverb | undefined;
  private JCReverb: JCReverb | undefined;
  private phaser: Phaser | undefined;
  private pingPongDelay: PingPongDelay | undefined;
  private pitchShift: PitchShift | undefined;
  private reverb: Reverb | undefined;
  private stereoWidener: StereoWidener | undefined;
  private tremolo: Tremolo | undefined;
  private vibrato: Vibrato | undefined;

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
            this.chebyshev!.order = Math.round(update.value);
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
    private audioStream: UserMedia,
    private micMediaStreamDestination: MediaStreamAudioDestinationNode,
    private masterChain: Gain<"gain">,
    private micChain: Gain<"gain">
  ) {}

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
        case "autoFilter":
          this.removeEffect(this.autoFilter);
          this.autoFilter = undefined;
          break;
        case "autoPanner":
          this.removeEffect(this.autoPanner);
          this.autoPanner = undefined;
          break;
        case "autoWah":
          this.removeEffect(this.autoWah);
          this.autoWah = undefined;
          break;
        case "bitCrusher":
          this.removeEffect(this.bitCrusher);
          this.bitCrusher = undefined;
          break;
        case "chebyshev":
          this.removeEffect(this.chebyshev);
          this.chebyshev = undefined;
          break;
        case "chorus":
          this.removeEffect(this.chorus);
          this.chorus = undefined;
          break;
        case "distortion":
          this.removeEffect(this.distortion);
          this.distortion = undefined;
          break;
        case "EQ":
          this.removeEffect(this.eq3);
          this.eq3 = undefined;
          break;
        case "feedbackDelay":
          this.removeEffect(this.feedbackDelay);
          this.feedbackDelay = undefined;
          break;
        case "freeverb":
          this.removeEffect(this.freeverb);
          this.freeverb = undefined;
          break;
        case "JCReverb":
          this.removeEffect(this.JCReverb);
          this.JCReverb = undefined;
          break;
        case "phaser":
          this.removeEffect(this.phaser);
          this.phaser = undefined;
          break;
        case "pingPongDelay":
          this.removeEffect(this.pingPongDelay);
          this.pingPongDelay = undefined;
          break;
        case "pitchShift":
          this.removeEffect(this.reverb);
          this.reverb = undefined;
          break;
        case "reverb":
          this.removeEffect(this.reverb);
          this.reverb = undefined;
          break;
        case "stereoWidener":
          this.removeEffect(this.stereoWidener);
          this.stereoWidener = undefined;
          break;
        case "tremolo":
          this.removeEffect(this.tremolo);
          this.tremolo = undefined;
          break;
        case "vibrato":
          this.removeEffect(this.vibrato);
          this.vibrato = undefined;
          break;
      }
    });
  };

  private removeEffect = (effect: ToneEffectsType | undefined) => {
    if (!effect) return;

    const effectIndex = this.micEffects.indexOf(effect);

    if (effectIndex !== -1) {
      effect.disconnect();

      if (effectIndex > 0) {
        this.micEffects[effectIndex - 1].disconnect();
        if (effectIndex < this.micEffects.length - 1) {
          this.micEffects[effectIndex - 1].connect(
            this.micEffects[effectIndex + 1]
          );
        } else {
          this.micEffects[effectIndex - 1].connect(
            this.micMediaStreamDestination
          );
        }
      } else {
        this.micChain.disconnect();
        if (this.micEffects.length > 1) {
          this.micChain.connect(this.micEffects[1]);
        } else {
          this.micChain.connect(this.micMediaStreamDestination);
        }
      }

      // Ensure the master chain is properly updated
      if (this.micEffects.length === 1) {
        this.micEffects[0].connect(this.masterChain);
      }

      this.micEffects.splice(effectIndex, 1);
      effect.dispose();
    }
  };

  private addEffect = (effect: ToneEffectsType) => {
    if (this.micEffects.length > 0) {
      this.micEffects[this.micEffects.length - 1].disconnect();
      this.micEffects[this.micEffects.length - 1].connect(effect);
    } else {
      this.micChain.disconnect();
      this.micChain.connect(effect);
    }

    this.audioStream.connect(effect);
    this.micEffects.push(effect);

    effect.connect(this.micMediaStreamDestination);
    effect.connect(this.masterChain);
  };

  /* 
    frequency: (0 - 10) Hz
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
  */
  private applyAutoFilter = () => {
    this.autoFilter = new AutoFilter().start();
    this.addEffect(this.autoFilter);
  };

  /* 
    frequency: (0 - 10) Hz
  */
  private applyAutoPanner = () => {
    this.autoPanner = new AutoPanner().start();
    this.addEffect(this.autoPanner);
  };

  /* 
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
    sensitivity: (-40 - 0) dB
  */
  private applyAutoWah = () => {
    this.autoWah = new AutoWah();
    this.addEffect(this.autoWah);
  };

  /* 
    bits: (1 - 8) bits
  */
  private applyBitCrusher = () => {
    this.bitCrusher = new BitCrusher();
    this.addEffect(this.bitCrusher);
  };

  /* 
    order: (1 - 100) order
  */
  private applyChebyshev = () => {
    this.chebyshev = new Chebyshev();
    this.addEffect(this.chebyshev);
  };

  /* 
    frequency: (0 - 10) Hz
    delayTime: (0 - 20) ms
    depth: (0 - 1) %
  */
  private applyChorus = () => {
    this.chorus = new Chorus().start();
    this.addEffect(this.chorus);
  };

  /* 
    distortion: (0 - 1) %
    oversample: (2, 4) x
  */
  private applyDistortion = () => {
    this.distortion = new Distortion();
    this.addEffect(this.distortion);
  };

  /* 
    low: (-24 - 24) dB
    mid: (-24 - 24) dB
    high: (-24 - 24) dB
  */
  private applyEQ = () => {
    this.eq3 = new EQ3();
    this.addEffect(this.eq3);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyFeedbackDelay = () => {
    this.feedbackDelay = new FeedbackDelay();
    this.addEffect(this.feedbackDelay);
  };

  /* 
    roomSize: (0 - 1) size
    dampening: (0 - 10000) Hz
  */
  private applyFreeverb = () => {
    this.freeverb = new Freeverb();
    this.addEffect(this.freeverb);
  };

  /* 
    roomSize: (0 - 1) size
  */
  private applyJCReverb = () => {
    this.JCReverb = new JCReverb();
    this.addEffect(this.JCReverb);
  };

  /* 
    frequency: (0 - 10) Hz
    octaves: (0 - 8) octaves
    baseFrequency: (0 - 10000) Hz
  */
  private applyPhaser = () => {
    this.phaser = new Phaser();
    this.addEffect(this.phaser);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyPingPongDelay = () => {
    this.pingPongDelay = new PingPongDelay();
    this.addEffect(this.pingPongDelay);
  };

  /* 
    pitch: (-12 - 12) semitones
  */
  private applyPitchShift = () => {
    this.pitchShift = new PitchShift();
    this.addEffect(this.pitchShift);
  };

  /* 
    decay: (1 - 10) seconds
    preDelay: (0 - 0.1) seconds
  */
  private applyReverb = () => {
    this.reverb = new Reverb();
    this.addEffect(this.reverb);
  };

  /* 
    width: (0 - 1) width
  */
  private applyStereoWidener = () => {
    this.stereoWidener = new StereoWidener();
    this.addEffect(this.stereoWidener);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyTremolo = () => {
    this.tremolo = new Tremolo().start();
    this.addEffect(this.tremolo);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyVibrato = () => {
    this.vibrato = new Vibrato();
    this.addEffect(this.vibrato);
  };
}

export default FgMic;
