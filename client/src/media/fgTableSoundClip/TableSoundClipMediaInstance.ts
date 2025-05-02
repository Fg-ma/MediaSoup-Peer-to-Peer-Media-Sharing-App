import { BaseContext, getContext, start } from "tone";
import {
  AudioEffectTypes,
  defaultAudioEffects,
  UserEffectsType,
} from "../../../../universal/effectsTypeConstant";
import AudioEffects from "../../audioEffects/AudioEffects";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";

class TableSoundClipMediaInstance {
  private audioSource: MediaStreamAudioSourceNode;
  private audioContext: BaseContext;
  private mediaStream: MediaStream;
  private masterMediaStream: MediaStream;

  private masterMediaStreamDestination: MediaStreamAudioDestinationNode;
  private audioStreamMediaStreamDestination: MediaStreamAudioDestinationNode;
  private samplerMediaStreamDestination: MediaStreamAudioDestinationNode;
  private soundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode;
  private backgroundMusicMediaStreamDestination: MediaStreamAudioDestinationNode;
  private assetSoundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode;

  audioEffects: AudioEffects;

  muted = false;

  private effects: {
    [audioEffect in AudioEffectTypes]?: boolean;
  };

  constructor(
    private soundClipId: string,
    private audioStream: MediaStream,
    private userEffects: React.MutableRefObject<UserEffectsType>,
  ) {
    this.effects = {};

    this.userEffects.current.soundClip[this.soundClipId] =
      structuredClone(defaultAudioEffects);

    // Create an AudioContext and MediaStreamDestination
    this.audioContext = getContext();
    this.masterMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.audioStreamMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.samplerMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.soundEffectsMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.backgroundMusicMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.assetSoundEffectsMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();

    // Create a source node from the provided MediaStream
    this.audioSource = this.audioContext.createMediaStreamSource(
      this.audioStream,
    );

    // Connect the source to the master MediaStreamDestination
    this.audioSource.connect(this.masterMediaStreamDestination);

    this.audioEffects = new AudioEffects(
      this.audioSource,
      this.masterMediaStreamDestination,
      undefined,
      this.audioStreamMediaStreamDestination,
      this.samplerMediaStreamDestination,
      this.soundEffectsMediaStreamDestination,
      this.backgroundMusicMediaStreamDestination,
      this.assetSoundEffectsMediaStreamDestination,
    );

    // Combine both MediaStreamDestinations into a single MediaStream
    this.mediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0],
    );

    // Add the sampler track (from samplerMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.samplerMediaStreamDestination.stream.getAudioTracks()[0],
    );

    // Add the sound effect track (from soundEffectsStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.soundEffectsMediaStreamDestination.stream.getAudioTracks()[0],
    );

    // Add the background music track (from backgroundMusicStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.backgroundMusicMediaStreamDestination.stream.getAudioTracks()[0],
    );

    // Add the asset sound effect track (from assetSoundEffectsStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.assetSoundEffectsMediaStreamDestination.stream.getAudioTracks()[0],
    );

    // Make master media stream
    this.masterMediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.masterMediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0],
    );

    start();
  }

  deconstructor = () => {
    this.audioEffects.deconstructor();
  };

  changeEffects = (
    effect: AudioEffectTypes,
    blockStateChange: boolean = false,
  ) => {
    if (!blockStateChange) {
      // Clear all old effects
      for (const oldEffect in this.userEffects.current.soundClip[
        this.soundClipId
      ]) {
        if (
          this.userEffects.current.soundClip[this.soundClipId][
            oldEffect as AudioEffectTypes
          ]
        ) {
          this.removeEffect(oldEffect as AudioEffectTypes);
        }
        if (oldEffect !== effect) {
          this.userEffects.current.soundClip[this.soundClipId][
            oldEffect as AudioEffectTypes
          ] = false;
        }
      }

      this.userEffects.current.soundClip[this.soundClipId][
        effect as AudioEffectTypes
      ] =
        !this.userEffects.current.soundClip[this.soundClipId][
          effect as AudioEffectTypes
        ];

      this.effects[effect] =
        this.userEffects.current.soundClip[this.soundClipId][
          effect as AudioEffectTypes
        ];
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.updateEffects([
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
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "distortion",
          "pitchShift",
          "phaser",
          "bitCrusher",
        ]);
        break;
      case "echo":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "feedbackDelay",
          "chorus",
        ]);
        break;
      case "alien":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "pitchShift",
          "phaser",
          "vibrato",
        ]);
        break;
      case "underwater":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "EQ",
          "autoFilter",
        ]);
        break;
      case "telephone":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "EQ",
          "distortion",
          "bitCrusher",
        ]);
        break;
      case "space":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "feedbackDelay",
          "chorus",
          "stereoWidener",
        ]);
        break;
      case "distortion":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "bitCrusher",
          "chebyshev",
        ]);
        break;
      case "vintage":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "bitCrusher",
          "reverb",
          "EQ",
        ]);
        break;
      case "psychedelic":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "autoFilter",
          "chorus",
          "vibrato",
          "pingPongDelay",
        ]);
        break;
      case "deepBass":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "EQ",
          "reverb",
          "stereoWidener",
        ]);
        break;
      case "highEnergy":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "reverb",
          "autoWah",
        ]);
        break;
      case "ambient":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "feedbackDelay",
          "freeverb",
          "stereoWidener",
        ]);
        break;
      case "glitch":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "bitCrusher",
          "distortion",
          "feedbackDelay",
          "pitchShift",
        ]);
        break;
      case "muffled":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "EQ",
          "reverb",
          "autoFilter",
        ]);
        break;
      case "crystal":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "pitchShift",
          "chorus",
          "feedbackDelay",
          "autoWah",
        ]);
        break;
      case "heavyMetal":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "EQ",
          "chebyshev",
        ]);
        break;
      case "dreamy":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "stereoWidener",
          "vibrato",
          "chorus",
        ]);
        break;
      case "horror":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "pitchShift",
          "phaser",
        ]);
        break;
      case "sciFi":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "autoFilter",
          "pitchShift",
          "reverb",
          "stereoWidener",
        ]);
        break;
      case "dystopian":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "phaser",
          "bitCrusher",
        ]);
        break;
      case "retroGame":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "bitCrusher",
          "feedbackDelay",
          "distortion",
          "autoPanner",
        ]);
        break;
      case "ghostly":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "pitchShift",
          "vibrato",
          "tremolo",
        ]);
        break;
      case "metallic":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "phaser",
          "distortion",
          "reverb",
          "chebyshev",
        ]);
        break;
      case "hypnotic":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "tremolo",
          "feedbackDelay",
          "chorus",
        ]);
        break;
      case "cyberpunk":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "autoWah",
          "stereoWidener",
        ]);
        break;
      case "windy":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "autoFilter",
          "vibrato",
        ]);
        break;
      case "radio":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "EQ",
          "distortion",
          "autoFilter",
        ]);
        break;
      case "explosion":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "reverb",
          "EQ",
        ]);
        break;
      case "whisper":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "EQ",
          "reverb",
          "stereoWidener",
        ]);
        break;
      case "submarine":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "autoFilter",
          "EQ",
        ]);
        break;
      case "windTunnel":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "autoFilter",
          "reverb",
          "vibrato",
        ]);
        break;
      case "crushedBass":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "bitCrusher",
          "EQ",
          "reverb",
        ]);
        break;
      case "ethereal":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "stereoWidener",
          "pitchShift",
        ]);
        break;
      case "electroSting":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "autoFilter",
          "distortion",
        ]);
        break;
      case "heartbeat":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "tremolo",
          "EQ",
          "reverb",
        ]);
        break;
      case "underworld":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "reverb",
          "phaser",
          "pitchShift",
        ]);
        break;
      case "sizzling":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "bitCrusher",
          "reverb",
        ]);
        break;
      case "staticNoise":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "bitCrusher",
          "autoFilter",
          "feedbackDelay",
        ]);
        break;
      case "bubbly":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "autoFilter",
          "pingPongDelay",
          "chorus",
        ]);
        break;
      case "thunder":
        this.audioEffects?.fgAudioEffects?.removeEffects([
          "distortion",
          "reverb",
          "pitchShift",
        ]);
        break;
      case "echosOfThePast":
        this.audioEffects?.fgAudioEffects?.removeEffects([
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
    }[],
  ) => {
    this.audioEffects.fgAudioEffects?.updateEffects(effects);
  };

  removeMixEffects = (effects: AudioMixEffectsType[]) => {
    this.audioEffects.fgAudioEffects?.removeEffects(effects);
  };

  toggleMute = () => {
    this.muted = !this.muted;
    this.masterMediaStreamDestination.stream.getAudioTracks()[0].enabled =
      !this.masterMediaStreamDestination.stream.getAudioTracks()[0].enabled;
  };

  getStream = () => {
    return this.masterMediaStream;
  };

  getTracks = () => {
    return this.masterMediaStream.getAudioTracks();
  };

  getMasterTrack = () => {
    return this.masterMediaStream.getAudioTracks()[0];
  };

  getMasterStream = () => {
    return this.masterMediaStream;
  };

  getAudioStreamTrack = () => {
    return this.audioStreamMediaStreamDestination.stream.getAudioTracks()[0];
  };

  getSamplerTrack = () => {
    return this.samplerMediaStreamDestination.stream.getAudioTracks()[0];
  };

  getAspect = () => {
    return undefined;
  };
}

export default TableSoundClipMediaInstance;
