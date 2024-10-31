import * as Tone from "tone";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  defaultAudioStreamEffects,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import AudioEffects, {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../audioEffects/AudioEffects";
import { FgSamplers } from "src/audioEffects/fgSamplers";

class AudioMedia {
  private audioContext: Tone.BaseContext;
  private mediaStream: MediaStream;
  private masterMediaStream: MediaStream;

  private masterMediaStreamDestination: MediaStreamAudioDestinationNode;
  private micMediaStreamDestination: MediaStreamAudioDestinationNode;
  private samplerMediaStreamDestination: MediaStreamAudioDestinationNode;
  private soundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode;

  audioEffects: AudioEffects;

  private effects: {
    [cameraEffect in AudioEffectTypes]?: boolean;
  };

  constructor(
    private username: string,
    private table_id: string,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    private audioStream: Tone.UserMedia
  ) {
    this.effects = {};

    // Create an AudioContext and MediaStreamDestination
    this.audioContext = Tone.context;
    this.masterMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.micMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.samplerMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.soundEffectsMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();

    // Connect the Tone.UserMedia instance to the MediaStreamDestination
    this.audioStream.connect(this.masterMediaStreamDestination);
    this.audioStream.connect(this.micMediaStreamDestination);

    this.audioEffects = new AudioEffects(
      this.audioStream,
      this.masterMediaStreamDestination,
      this.micMediaStreamDestination,
      this.samplerMediaStreamDestination,
      this.soundEffectsMediaStreamDestination
    );

    // Combine both MediaStreamDestinations into a single MediaStream
    this.mediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0]
    );

    // Add the mic track (from micMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.micMediaStreamDestination.stream.getAudioTracks()[0]
    );

    // Add the sampler track (from samplerMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.samplerMediaStreamDestination.stream.getAudioTracks()[0]
    );

    // Add the sampler track (from samplerMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.soundEffectsMediaStreamDestination.stream.getAudioTracks()[0]
    );

    // Make master media stream
    this.masterMediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.masterMediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0]
    );
  }

  openMic = async () => {
    await this.audioStream.open();

    // Fix this it is janky way of getting mic started
    this.audioEffects.updateEffects([
      {
        type: "reverb",
        updates: [{ option: "decay", value: 1 }],
      },
    ]);
    this.audioEffects.removeEffects(["reverb"]);
  };

  deconstructor = () => {
    this.audioStream.close();
  };

  changeEffects = (
    effect: AudioEffectTypes,
    blockStateChange: boolean = false
  ) => {
    if (!blockStateChange) {
      // Clear all old effects
      for (const oldEffect in this.userStreamEffects.current.audio) {
        if (
          this.userStreamEffects.current.audio[oldEffect as AudioEffectTypes]
        ) {
          this.removeEffect(oldEffect as AudioEffectTypes);
        }
        if (oldEffect !== effect) {
          this.userStreamEffects.current.audio[oldEffect as AudioEffectTypes] =
            false;
        }
      }

      this.userStreamEffects.current.audio[effect as AudioEffectTypes] =
        !this.userStreamEffects.current.audio[effect as AudioEffectTypes];

      this.effects[effect] =
        this.userStreamEffects.current.audio[effect as AudioEffectTypes];
    }

    if (this.effects[effect]) {
      this.applyEffect(effect);
    } else if (!this.effects[effect]) {
      this.removeEffect(effect);
    }
  };

  applyEffect = (effect: AudioEffectTypes) => {
    switch (effect) {
      case "robot":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 2 },
              { option: "preDelay", value: 0.2 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.8 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -6 }],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 5 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 500 },
            ],
          },
          {
            type: "bitCrusher",
            updates: [
              { option: "bits", value: 4 }, // Reducing bit depth for a more robotic sound
            ],
          },
        ]);
        break;
      case "echo":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 4 },
              { option: "preDelay", value: 0.4 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.5 },
              { option: "feedback", value: 0.4 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 1.5 },
              { option: "depth", value: 0.7 },
            ],
          },
        ]);
        break;
      case "alien":
        this.audioEffects?.updateEffects([
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: 12 }],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 10 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 1000 },
            ],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 8 },
              { option: "depth", value: 0.8 },
            ],
          },
        ]);
        break;
      case "underwater":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 3 },
              { option: "preDelay", value: 0.1 },
            ],
          },
          {
            type: "EQ",
            updates: [{ option: "high", value: -12 }],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.3 },
              { option: "baseFrequency", value: 200 },
              { option: "octaves", value: 2 },
            ],
          },
        ]);
        break;
      case "telephone":
        this.audioEffects?.updateEffects([
          {
            type: "EQ",
            updates: [
              { option: "low", value: -24 },
              { option: "mid", value: 10 },
              { option: "high", value: -24 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.2 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 6 }],
          },
        ]);
        break;
      case "space":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 8 },
              { option: "preDelay", value: 0.5 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.8 },
              { option: "feedback", value: 0.7 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 1.2 },
              { option: "depth", value: 0.6 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.9 }],
          },
        ]);
        break;
      case "distortion":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 1 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 3 }],
          },
          {
            type: "chebyshev",
            updates: [{ option: "order", value: 50 }],
          },
        ]);
        break;
      case "vintage":
        this.audioEffects?.updateEffects([
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 6 }],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 4 },
              { option: "preDelay", value: 0.3 },
            ],
          },
          {
            type: "EQ",
            updates: [
              { option: "low", value: -8 },
              { option: "mid", value: 5 },
              { option: "high", value: -6 },
            ],
          },
        ]);
        break;
      case "psychedelic":
        this.audioEffects?.updateEffects([
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.5 },
              { option: "baseFrequency", value: 800 },
              { option: "octaves", value: 4 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 4 },
              { option: "depth", value: 0.8 },
            ],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 5 },
              { option: "depth", value: 0.9 },
            ],
          },
          {
            type: "pingPongDelay",
            updates: [
              { option: "delayTime", value: 0.3 },
              { option: "feedback", value: 0.6 },
            ],
          },
        ]);
        break;
      case "deepBass":
        this.audioEffects?.updateEffects([
          {
            type: "EQ",
            updates: [
              { option: "low", value: 10 },
              { option: "mid", value: -6 },
              { option: "high", value: -12 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 6 },
              { option: "preDelay", value: 0.4 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.5 }],
          },
        ]);
        break;
      case "highEnergy":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.9 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 5 },
              { option: "preDelay", value: 0.3 },
            ],
          },
          {
            type: "autoWah",
            updates: [
              { option: "baseFrequency", value: 1000 },
              { option: "octaves", value: 3 },
              { option: "sensitivity", value: -20 },
            ],
          },
        ]);
        break;
      case "ambient":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 8 },
              { option: "preDelay", value: 0.6 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.6 },
              { option: "feedback", value: 0.5 },
            ],
          },
          {
            type: "freeverb",
            updates: [
              { option: "roomSize", value: 0.8 },
              { option: "dampening", value: 6000 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.8 }],
          },
        ]);
        break;
      case "glitch":
        this.audioEffects?.updateEffects([
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 2 }],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.7 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.05 },
              { option: "feedback", value: 0.3 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: 3 }],
          },
        ]);
        break;
      case "muffled":
        this.audioEffects?.updateEffects([
          {
            type: "EQ",
            updates: [
              { option: "high", value: -24 },
              { option: "mid", value: -6 },
              { option: "low", value: 0 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 2 },
              { option: "preDelay", value: 0.1 },
            ],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.1 },
              { option: "baseFrequency", value: 300 },
            ],
          },
        ]);
        break;
      case "crystal":
        this.audioEffects?.updateEffects([
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: 7 }],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 3 },
              { option: "depth", value: 0.7 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.5 },
              { option: "feedback", value: 0.6 },
            ],
          },
          {
            type: "autoWah",
            updates: [
              { option: "baseFrequency", value: 600 },
              { option: "octaves", value: 4 },
            ],
          },
        ]);
        break;
      case "heavyMetal":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 1 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "EQ",
            updates: [
              { option: "low", value: 10 },
              { option: "mid", value: 4 },
              { option: "high", value: -6 },
            ],
          },
          {
            type: "chebyshev",
            updates: [{ option: "order", value: 50 }],
          },
        ]);
        break;
      case "dreamy":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 8 },
              { option: "preDelay", value: 0.6 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.9 }],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 3 },
              { option: "depth", value: 0.5 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 1.5 },
              { option: "depth", value: 0.5 },
            ],
          },
        ]);
        break;
      case "horror":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 9 },
              { option: "preDelay", value: 0.8 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -12 }],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 5 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 400 },
            ],
          },
        ]);
        break;
      case "sciFi":
        this.audioEffects?.updateEffects([
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.5 },
              { option: "baseFrequency", value: 600 },
              { option: "octaves", value: 3 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: 5 }],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 6 },
              { option: "preDelay", value: 0.4 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.8 }],
          },
        ]);
        break;
      case "dystopian":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.9 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 4 },
              { option: "octaves", value: 2 },
              { option: "baseFrequency", value: 500 },
            ],
          },
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 3 }],
          },
        ]);
        break;
      case "retroGame":
        this.audioEffects?.updateEffects([
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 2 }],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.1 },
              { option: "feedback", value: 0.6 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.5 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "autoPanner",
            updates: [{ option: "frequency", value: 3 }],
          },
        ]);
        break;
      case "ghostly":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 9 },
              { option: "preDelay", value: 0.7 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -4 }],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 2 },
              { option: "depth", value: 0.5 },
            ],
          },
          {
            type: "tremolo",
            updates: [
              { option: "frequency", value: 1 },
              { option: "depth", value: 0.7 },
            ],
          },
        ]);
        break;
      case "metallic":
        this.audioEffects?.updateEffects([
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 8 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 1000 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.6 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 5 },
              { option: "preDelay", value: 0.3 },
            ],
          },
          {
            type: "chebyshev",
            updates: [{ option: "order", value: 30 }],
          },
        ]);
        break;
      case "hypnotic":
        this.audioEffects?.updateEffects([
          {
            type: "tremolo",
            updates: [
              { option: "frequency", value: 4 },
              { option: "depth", value: 0.8 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.4 },
              { option: "feedback", value: 0.6 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 1.5 },
              { option: "depth", value: 0.5 },
            ],
          },
        ]);
        break;
      case "cyberpunk":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.9 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "autoWah",
            updates: [
              { option: "baseFrequency", value: 1000 },
              { option: "octaves", value: 3 },
              { option: "sensitivity", value: -20 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.9 }],
          },
        ]);
        break;
      case "windy":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 7 },
              { option: "preDelay", value: 0.4 },
            ],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.3 },
              { option: "baseFrequency", value: 300 },
              { option: "octaves", value: 2 },
            ],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 2 },
              { option: "depth", value: 0.4 },
            ],
          },
        ]);
        break;
      case "radio":
        this.audioEffects?.updateEffects([
          {
            type: "EQ",
            updates: [
              { option: "low", value: -18 },
              { option: "mid", value: -9 },
              { option: "high", value: -6 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.4 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.4 },
              { option: "baseFrequency", value: 550 },
              { option: "octaves", value: 1 },
            ],
          },
        ]);
        break;
      case "explosion":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 1 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 10 },
              { option: "preDelay", value: 0.7 },
            ],
          },
          {
            type: "EQ",
            updates: [
              { option: "low", value: 14 },
              { option: "mid", value: -8 },
              { option: "high", value: -15 },
            ],
          },
        ]);
        break;
      case "whisper":
        this.audioEffects?.updateEffects([
          {
            type: "EQ",
            updates: [
              { option: "low", value: -12 },
              { option: "mid", value: -15 },
              { option: "high", value: -24 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 8 },
              { option: "preDelay", value: 0.3 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 0.9 }],
          },
        ]);
        break;
      case "submarine":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 5 },
              { option: "preDelay", value: 0.4 },
            ],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.2 }, // Low frequency for underwater resonance
              { option: "baseFrequency", value: 200 }, // Deep underwater resonance
              { option: "octaves", value: 1.5 },
            ],
          },
          {
            type: "EQ",
            updates: [{ option: "low", value: 10 }],
          },
        ]);
        break;
      case "windTunnel":
        this.audioEffects?.updateEffects([
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.6 },
              { option: "baseFrequency", value: 1200 },
              { option: "octaves", value: 2.5 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 6 },
              { option: "preDelay", value: 0.3 },
            ],
          },
          {
            type: "vibrato",
            updates: [
              { option: "frequency", value: 4 },
              { option: "depth", value: 0.6 },
            ],
          },
        ]);
        break;
      case "crushedBass":
        this.audioEffects?.updateEffects([
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 2 }],
          },
          {
            type: "EQ",
            updates: [{ option: "low", value: 14 }],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 4 },
              { option: "preDelay", value: 0.2 },
            ],
          },
        ]);
        break;
      case "ethereal":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 12 },
              { option: "preDelay", value: 0.8 },
            ],
          },
          {
            type: "stereoWidener",
            updates: [{ option: "width", value: 1 }],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: 7 }],
          },
        ]);
        break;
      case "electroSting":
        this.audioEffects?.updateEffects([
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.7 },
              { option: "baseFrequency", value: 2200 },
              { option: "octaves", value: 4.5 },
            ],
          },
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.8 },
              { option: "oversample", value: 4 },
            ],
          },
        ]);
        break;
      case "heartbeat":
        this.audioEffects?.updateEffects([
          {
            type: "tremolo",
            updates: [
              { option: "frequency", value: 1.2 },
              { option: "depth", value: 0.9 },
            ],
          },
          {
            type: "EQ",
            updates: [{ option: "low", value: 12 }],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 4 },
              { option: "preDelay", value: 0.1 },
            ],
          },
        ]);
        break;
      case "underworld":
        this.audioEffects?.updateEffects([
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 9 },
              { option: "preDelay", value: 0.6 },
            ],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 3.5 },
              { option: "octaves", value: 2.5 },
              { option: "baseFrequency", value: 250 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -5 }],
          },
        ]);
        break;
      case "sizzling":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 0.6 },
              { option: "oversample", value: 2 },
            ],
          },
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 3 }],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 5 },
              { option: "preDelay", value: 0.3 },
            ],
          },
        ]);
        break;
      case "staticNoise":
        this.audioEffects?.updateEffects([
          {
            type: "bitCrusher",
            updates: [{ option: "bits", value: 2 }],
          },
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.8 },
              { option: "baseFrequency", value: 500 },
              { option: "octaves", value: 2 },
            ],
          },
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.02 },
              { option: "feedback", value: 0.7 },
            ],
          },
        ]);
        break;
      case "bubbly":
        this.audioEffects?.updateEffects([
          {
            type: "autoFilter",
            updates: [
              { option: "frequency", value: 0.5 },
              { option: "baseFrequency", value: 250 },
              { option: "octaves", value: 2 },
            ],
          },
          {
            type: "pingPongDelay",
            updates: [
              { option: "delayTime", value: 0.2 },
              { option: "feedback", value: 0.6 },
            ],
          },
          {
            type: "chorus",
            updates: [
              { option: "frequency", value: 4 },
              { option: "depth", value: 0.6 },
            ],
          },
        ]);
        break;
      case "thunder":
        this.audioEffects?.updateEffects([
          {
            type: "distortion",
            updates: [
              { option: "distortion", value: 1 },
              { option: "oversample", value: 4 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 10 },
              { option: "preDelay", value: 0.8 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -2 }],
          },
        ]);
        break;
      case "echosOfThePast":
        this.audioEffects?.updateEffects([
          {
            type: "feedbackDelay",
            updates: [
              { option: "delayTime", value: 0.8 },
              { option: "feedback", value: 0.7 },
            ],
          },
          {
            type: "reverb",
            updates: [
              { option: "decay", value: 9 },
              { option: "preDelay", value: 0.7 },
            ],
          },
          {
            type: "pitchShift",
            updates: [{ option: "pitch", value: -3 }],
          },
        ]);
        break;
      default:
        break;
    }
  };

  removeEffect = (effect: AudioEffectTypes) => {
    switch (effect) {
      case "robot":
        this.audioEffects?.removeEffects([
          "reverb",
          "distortion",
          "pitchShift",
          "phaser",
          "bitCrusher",
        ]);
        break;
      case "echo":
        this.audioEffects?.removeEffects(["reverb", "feedbackDelay", "chorus"]);
        break;
      case "alien":
        this.audioEffects?.removeEffects(["pitchShift", "phaser", "vibrato"]);
        break;
      case "underwater":
        this.audioEffects?.removeEffects(["reverb", "EQ", "autoFilter"]);
        break;
      case "telephone":
        this.audioEffects?.removeEffects(["EQ", "distortion", "bitCrusher"]);
        break;
      case "space":
        this.audioEffects?.removeEffects([
          "reverb",
          "feedbackDelay",
          "chorus",
          "stereoWidener",
        ]);
        break;
      case "distortion":
        this.audioEffects?.removeEffects([
          "distortion",
          "bitCrusher",
          "chebyshev",
        ]);
        break;
      case "vintage":
        this.audioEffects?.removeEffects(["bitCrusher", "reverb", "EQ"]);
        break;
      case "psychedelic":
        this.audioEffects?.removeEffects([
          "autoFilter",
          "chorus",
          "vibrato",
          "pingPongDelay",
        ]);
        break;
      case "deepBass":
        this.audioEffects?.removeEffects(["EQ", "reverb", "stereoWidener"]);
        break;
      case "highEnergy":
        this.audioEffects?.removeEffects(["distortion", "reverb", "autoWah"]);
        break;
      case "ambient":
        this.audioEffects?.removeEffects([
          "reverb",
          "feedbackDelay",
          "freeverb",
          "stereoWidener",
        ]);
        break;
      case "glitch":
        this.audioEffects?.removeEffects([
          "bitCrusher",
          "distortion",
          "feedbackDelay",
          "pitchShift",
        ]);
        break;
      case "muffled":
        this.audioEffects?.removeEffects(["EQ", "reverb", "autoFilter"]);
        break;
      case "crystal":
        this.audioEffects?.removeEffects([
          "pitchShift",
          "chorus",
          "feedbackDelay",
          "autoWah",
        ]);
        break;
      case "heavyMetal":
        this.audioEffects?.removeEffects(["distortion", "EQ", "chebyshev"]);
        break;
      case "dreamy":
        this.audioEffects?.removeEffects([
          "reverb",
          "stereoWidener",
          "vibrato",
          "chorus",
        ]);
        break;
      case "horror":
        this.audioEffects?.removeEffects(["reverb", "pitchShift", "phaser"]);
        break;
      case "sciFi":
        this.audioEffects?.removeEffects([
          "autoFilter",
          "pitchShift",
          "reverb",
          "stereoWidener",
        ]);
        break;
      case "dystopian":
        this.audioEffects?.removeEffects([
          "distortion",
          "phaser",
          "bitCrusher",
        ]);
        break;
      case "retroGame":
        this.audioEffects?.removeEffects([
          "bitCrusher",
          "feedbackDelay",
          "distortion",
          "autoPanner",
        ]);
        break;
      case "ghostly":
        this.audioEffects?.removeEffects([
          "reverb",
          "pitchShift",
          "vibrato",
          "tremolo",
        ]);
        break;
      case "metallic":
        this.audioEffects?.removeEffects([
          "phaser",
          "distortion",
          "reverb",
          "chebyshev",
        ]);
        break;
      case "hypnotic":
        this.audioEffects?.removeEffects([
          "tremolo",
          "feedbackDelay",
          "chorus",
        ]);
        break;
      case "cyberpunk":
        this.audioEffects?.removeEffects([
          "distortion",
          "autoWah",
          "stereoWidener",
        ]);
        break;
      case "windy":
        this.audioEffects?.removeEffects(["reverb", "autoFilter", "vibrato"]);
        break;
      case "radio":
        this.audioEffects?.removeEffects(["EQ", "distortion", "autoFilter"]);
        break;
      case "explosion":
        this.audioEffects?.removeEffects(["distortion", "reverb", "EQ"]);
        break;
      case "whisper":
        this.audioEffects?.removeEffects(["EQ", "reverb", "stereoWidener"]);
        break;
      case "submarine":
        this.audioEffects?.removeEffects(["reverb", "autoFilter", "EQ"]);
        break;
      case "windTunnel":
        this.audioEffects?.removeEffects(["autoFilter", "reverb", "vibrato"]);
        break;
      case "crushedBass":
        this.audioEffects?.removeEffects(["bitCrusher", "EQ", "reverb"]);
        break;
      case "ethereal":
        this.audioEffects?.removeEffects([
          "reverb",
          "stereoWidener",
          "pitchShift",
        ]);
        break;
      case "electroSting":
        this.audioEffects?.removeEffects(["autoFilter", "distortion"]);
        break;
      case "heartbeat":
        this.audioEffects?.removeEffects(["tremolo", "EQ", "reverb"]);
        break;
      case "underworld":
        this.audioEffects?.removeEffects(["reverb", "phaser", "pitchShift"]);
        break;
      case "sizzling":
        this.audioEffects?.removeEffects([
          "distortion",
          "bitCrusher",
          "reverb",
        ]);
        break;
      case "staticNoise":
        this.audioEffects?.removeEffects([
          "bitCrusher",
          "autoFilter",
          "feedbackDelay",
        ]);
        break;
      case "bubbly":
        this.audioEffects?.removeEffects([
          "autoFilter",
          "pingPongDelay",
          "chorus",
        ]);
        break;
      case "thunder":
        this.audioEffects?.removeEffects([
          "distortion",
          "reverb",
          "pitchShift",
        ]);
        break;
      case "echosOfThePast":
        this.audioEffects?.removeEffects([
          "feedbackDelay",
          "reverb",
          "pitchShift",
        ]);
        break;
      default:
        break;
    }
  };

  mixEffects = (
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) => {
    this.audioEffects.updateEffects(effects);
  };

  removeMixEffects = (effects: AudioMixEffectsType[]) => {
    this.audioEffects.removeEffects(effects);
  };

  samplerEffectsChange = (
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) => {
    this.audioEffects.fgSampler.updateEffects(effects);
  };

  removeSamplerEffects = (effects: AudioMixEffectsType[]) => {
    this.audioEffects.fgSampler.removeEffects(effects);
  };

  playNote = (note: string, isPress: boolean) => {
    this.audioEffects.fgSampler.playNote(note, isPress);
  };

  swapSampler = (
    sampler: { category: string; kind: string },
    increment?: number
  ): FgSamplers => {
    return this.audioEffects.fgSampler.swapSampler(sampler, increment);
  };

  muteMic = (isMuted: boolean) => {
    this.audioEffects.setMicChainMute(isMuted);
  };

  // Set volume (in decibels)
  setSamplerVolume = (volume: number) => {
    this.audioEffects.fgSampler.setVolume(volume);
  };

  startMetronome = () => {
    return this.audioEffects.fgSampler.fgMetronome.startMetronome();
  };

  stopMetronome = () => {
    return this.audioEffects.fgSampler.fgMetronome.stopMetronome();
  };

  setMetronomeBPM = (bpm: number) => {
    this.audioEffects.fgSampler.fgMetronome.setMetronomeBPM(bpm);
  };

  setMetronomeVolume = (volume: number) => {
    this.audioEffects.fgSampler.fgMetronome.setMetronomeVolume(volume);
  };

  getStream = () => {
    return this.mediaStream;
  };

  getTracks = () => {
    return this.mediaStream.getAudioTracks();
  };

  getMasterTrack = () => {
    return this.masterMediaStreamDestination.stream.getAudioTracks()[0];
  };

  getMasterStream = () => {
    return this.masterMediaStream;
  };

  getMicTrack = () => {
    return this.micMediaStreamDestination.stream.getAudioTracks()[0];
  };

  getSamplerTrack = () => {
    return this.samplerMediaStreamDestination.stream.getAudioTracks()[0];
  };
}

export default AudioMedia;
