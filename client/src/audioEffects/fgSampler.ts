import * as Tone from "tone";
import { AudioMixEffectsType, MixEffectsOptionsType } from "./AudioEffects";
import fgSamplers, { FgSamplers } from "./fgSamplers";
import FgMetronome from "./fgMetronome";

class FgSampler {
  private sampler: Tone.Sampler | undefined;
  private playOnlyDefined: boolean;
  private definedNotes: string[] = [];

  private samplerEffects: any[] = [];

  private playingNotes: Set<string> = new Set();

  private volumeNode: Tone.Volume;
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

  fgMetronome: FgMetronome;

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
    private samplerMediaStreamDestination: MediaStreamAudioDestinationNode,
    private masterChain: Tone.Gain,
    private samplerChain: Tone.Gain
  ) {
    this.volumeNode = new Tone.Volume(0); // 0 dB by default

    this.sampler = new Tone.Sampler(fgSamplers.pianos.default.sampler);
    this.playOnlyDefined = fgSamplers.pianos.default.playOnlyDefined;

    // Set up the initial connections
    this.sampler.connect(this.volumeNode);
    this.volumeNode.connect(this.samplerChain); // Connect volumeNode to the sampler chain
    this.samplerChain.connect(this.samplerMediaStreamDestination); // Connect sampler chain to mediaStreamDestination

    this.fgMetronome = new FgMetronome();
  }

  swapSampler = (
    sampler: { category: string; kind: string },
    increment?: number
  ): FgSamplers => {
    // Disconnect and dispose of the current sampler if it exists
    if (this.sampler) {
      this.sampler.disconnect();
      this.sampler.dispose();
    }

    if (increment === undefined) {
      this.sampler = new Tone.Sampler(
        // @ts-ignore
        fgSamplers[sampler.category][sampler.kind].sampler
      );
      this.sampler.connect(this.volumeNode);
      this.playOnlyDefined =
        // @ts-ignore
        fgSamplers[sampler.category][sampler.kind].playOnlyDefined;

      if (this.playOnlyDefined) {
        this.definedNotes = Object.keys(
          // @ts-ignore
          fgSamplers[sampler.category][sampler.kind].sampler.urls
        );
      }

      return {
        category: sampler.category,
        kind: sampler.kind,
        // @ts-ignore
        label: fgSamplers[sampler.category][sampler.kind].label,
        playOnlyDefined: this.playOnlyDefined,
        definedNotes: this.definedNotes,
      } as FgSamplers;
    } else {
      // Get an array of sampler kinds in the category
      // @ts-ignore
      const kinds = Object.keys(fgSamplers[sampler.category]);

      // Find the index of the current kind
      const currentIndex = kinds.indexOf(sampler.kind);
      if (currentIndex === -1) throw new Error("Invalid sampler kind");

      // Calculate the new index, wrapping around if necessary
      const newIndex = (currentIndex + increment + kinds.length) % kinds.length;
      const newKind = kinds[newIndex];

      this.sampler = new Tone.Sampler(
        // @ts-ignore
        fgSamplers[sampler.category][newKind].sampler
      );
      this.sampler.connect(this.volumeNode);
      this.playOnlyDefined =
        // @ts-ignore
        fgSamplers[sampler.category][newKind].playOnlyDefined;
      if (this.playOnlyDefined) {
        this.definedNotes = Object.keys(
          // @ts-ignore
          fgSamplers[sampler.category][newKind].sampler.urls
        );
      }

      return {
        // @ts-ignore
        category: sampler.category,
        kind: newKind as any,
        // @ts-ignore
        label: fgSamplers[sampler.category][newKind].label,
        playOnlyDefined: this.playOnlyDefined,
        definedNotes: this.definedNotes,
      };
    }
  };

  // Trigger a note when a key is pressed
  playNote = (note: string, isPress: boolean) => {
    if (!this.sampler?.loaded) {
      return;
    }

    if (isPress) {
      if (!this.playingNotes.has(note)) {
        this.playingNotes.add(note);
        if (this.playOnlyDefined) {
          if (this.definedNotes.includes(note)) {
            this.sampler?.triggerAttack(note);
          }
        } else {
          this.sampler?.triggerAttack(note);
        }
      }
    } else {
      if (this.playingNotes.has(note)) {
        this.playingNotes.delete(note);
        this.sampler?.triggerRelease(note);
      }
    }
  };

  // Set volume (in decibels)
  setVolume = (volume: number) => {
    this.volumeNode.volume.value = volume;
  };

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

  private removeEffect(effect: any | undefined) {
    if (!effect) return;

    const effectIndex = this.samplerEffects.indexOf(effect);

    if (effectIndex !== -1) {
      // Disconnect the effect from the chain
      effect.disconnect();

      // Reconnect the previous effect in the chain to the next one
      if (effectIndex > 0) {
        this.samplerEffects[effectIndex - 1].disconnect();
        if (effectIndex < this.samplerEffects.length - 1) {
          this.samplerEffects[effectIndex - 1].connect(
            this.samplerEffects[effectIndex + 1]
          );
        } else {
          this.samplerEffects[effectIndex - 1].connect(
            this.samplerMediaStreamDestination
          );
        }
      } else {
        // If it's the first effect, reconnect the effectChain to the next effect or mediaStreamDestination
        this.samplerChain.disconnect();
        if (this.samplerEffects.length > 1) {
          this.samplerChain.connect(this.samplerEffects[1]);
        } else {
          this.samplerChain.connect(this.samplerMediaStreamDestination);
        }
      }

      // Ensure the master chain is properly updated
      if (this.samplerEffects.length === 1) {
        this.samplerEffects[0].connect(this.masterChain);
      }

      // Remove the effect from the array
      this.samplerEffects.splice(effectIndex, 1);

      // Dispose of the effect
      effect.dispose();
    }
  }

  private addEffect(effect: any) {
    // Disconnect the last effect in the chain from the mediaStreamDestination
    if (this.samplerEffects.length > 0) {
      this.samplerEffects[this.samplerEffects.length - 1].disconnect();
      this.samplerEffects[this.samplerEffects.length - 1].connect(effect);
    } else {
      this.samplerChain.disconnect();
      this.samplerChain.connect(effect);
    }

    // Add the new effect to the chain
    this.samplerEffects.push(effect);

    // Connect the new effect to the mediaStreamDestination
    effect.connect(this.samplerMediaStreamDestination);
    effect.connect(this.masterChain);
  }

  /* 
    frequency: (0 - 10) Hz
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
  */
  private applyAutoFilter = () => {
    this.autoFilter = new Tone.AutoFilter().start();
    this.addEffect(this.autoFilter);
  };

  /* 
    frequency: (0 - 10) Hz
  */
  private applyAutoPanner = () => {
    this.autoPanner = new Tone.AutoPanner().start();
    this.addEffect(this.autoPanner);
  };

  /* 
    baseFrequency: (0 - 10000) Hz
    octaves: (0 - 8) octaves
    sensitivity: (-40 - 0) dB
  */
  private applyAutoWah = () => {
    this.autoWah = new Tone.AutoWah();
    this.addEffect(this.autoWah);
  };

  /* 
    bits: (1 - 8) bits
  */
  private applyBitCrusher = () => {
    this.bitCrusher = new Tone.BitCrusher();
    this.addEffect(this.bitCrusher);
  };

  /* 
    order: (1 - 100) order
  */
  private applyChebyshev = () => {
    this.chebyshev = new Tone.Chebyshev();
    this.addEffect(this.chebyshev);
  };

  /* 
    frequency: (0 - 10) Hz
    delayTime: (0 - 20) ms
    depth: (0 - 1) %
  */
  private applyChorus = () => {
    this.chorus = new Tone.Chorus().start();
    this.addEffect(this.chorus);
  };

  /* 
    distortion: (0 - 1) %
    oversample: (2, 4) x
  */
  private applyDistortion = () => {
    this.distortion = new Tone.Distortion();
    this.addEffect(this.distortion);
  };

  /* 
    low: (-24 - 24) dB
    mid: (-24 - 24) dB
    high: (-24 - 24) dB
  */
  private applyEQ = () => {
    this.eq3 = new Tone.EQ3();
    this.addEffect(this.eq3);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyFeedbackDelay = () => {
    this.feedbackDelay = new Tone.FeedbackDelay();
    this.addEffect(this.feedbackDelay);
  };

  /* 
    roomSize: (0 - 1) size
    dampening: (0 - 10000) Hz
  */
  private applyFreeverb = () => {
    this.freeverb = new Tone.Freeverb();
    this.addEffect(this.freeverb);
  };

  /* 
    roomSize: (0 - 1) size
  */
  private applyJCReverb = () => {
    this.JCReverb = new Tone.JCReverb();
    this.addEffect(this.JCReverb);
  };

  /* 
    frequency: (0 - 10) Hz
    octaves: (0 - 8) octaves
    baseFrequency: (0 - 10000) Hz
  */
  private applyPhaser = () => {
    this.phaser = new Tone.Phaser();
    this.addEffect(this.phaser);
  };

  /* 
    delayTime: (0 - 1) seconds
    feedback: (0 - 1) %
  */
  private applyPingPongDelay = () => {
    this.pingPongDelay = new Tone.PingPongDelay();
    this.addEffect(this.pingPongDelay);
  };

  /* 
    pitch: (-12 - 12) semitones
  */
  private applyPitchShift = () => {
    this.pitchShift = new Tone.PitchShift();
    this.addEffect(this.pitchShift);
  };

  /* 
    decay: (1 - 10) seconds
    preDelay: (0 - 0.1) seconds
  */
  private applyReverb = () => {
    this.reverb = new Tone.Reverb();
    this.addEffect(this.reverb);
  };

  /* 
    width: (0 - 1) width
  */
  private applyStereoWidener = () => {
    this.stereoWidener = new Tone.StereoWidener();
    this.addEffect(this.stereoWidener);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyTremolo = () => {
    this.tremolo = new Tone.Tremolo().start();
    this.addEffect(this.tremolo);
  };

  /* 
    frequency: (0 - 10) Hz
    depth: (0 - 1) %
  */
  private applyVibrato = () => {
    this.vibrato = new Tone.Vibrato();
    this.addEffect(this.vibrato);
  };
}

export default FgSampler;
