import * as Tone from "tone";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import AudioEffects, {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../effects/audioEffects/AudioEffects";
import { FgSamplers } from "../effects/audioEffects/fgSamplers";

class AudioMedia {
  private username: string;
  private table_id: string;

  private audioStream: Tone.UserMedia;
  private audioContext: Tone.BaseContext;
  private mediaStream: MediaStream;
  private masterMediaStream: MediaStream;

  private masterMediaStreamDestination: MediaStreamAudioDestinationNode;
  private micMediaStreamDestination: MediaStreamAudioDestinationNode;
  private samplerMediaStreamDestination: MediaStreamAudioDestinationNode;

  private audioEffects: AudioEffects;

  private userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]?: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]?: boolean };
    };
    audio: { [effectType in AudioEffectTypes]?: boolean };
  }>;

  private effects: {
    [cameraEffect in AudioEffectTypes]?: boolean;
  };

  constructor(
    username: string,
    table_id: string,
    userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>,
    audioStream: Tone.UserMedia
  ) {
    this.username = username;
    this.table_id = table_id;
    this.userStreamEffects = userStreamEffects;

    this.audioStream = audioStream;

    // Create an AudioContext and MediaStreamDestination
    this.audioContext = Tone.context;
    this.masterMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.micMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    this.samplerMediaStreamDestination =
      this.audioContext.createMediaStreamDestination();

    // Connect the Tone.UserMedia instance to the MediaStreamDestination
    this.audioStream.connect(this.masterMediaStreamDestination);
    this.audioStream.connect(this.micMediaStreamDestination);

    this.audioEffects = new AudioEffects(
      this.audioStream,
      this.masterMediaStreamDestination,
      this.micMediaStreamDestination,
      this.samplerMediaStreamDestination
    );

    this.effects = {};

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

    // Make master media stream
    this.masterMediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.masterMediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0]
    );
  }

  async openMic() {
    await this.audioStream.open();

    // Fix this it is janky way of getting mic started
    this.audioEffects.updateEffects([
      {
        type: "reverb",
        updates: [{ option: "decay", value: 1 }],
      },
    ]);
    this.audioEffects.removeEffects(["reverb"]);
  }

  deconstructor() {
    this.audioStream.close();
  }

  async changeEffects(
    effect: AudioEffectTypes,
    blockStateChange: boolean = false
  ) {
    if (!blockStateChange) {
      this.userStreamEffects.current.audio[effect as AudioEffectTypes] =
        !this.userStreamEffects.current.audio[effect as AudioEffectTypes];
    }

    if (this.effects[effect] !== undefined) {
      if (!blockStateChange) {
        this.effects[effect] = !this.effects[effect];
      }
    } else {
      this.effects[effect] = true;
    }

    if (this.effects[effect]) {
      this.applyEffect(effect);
    } else {
      this.removeEffect(effect);
    }
  }

  applyEffect(effect: AudioEffectTypes) {
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
      default:
        break;
    }
  }

  removeEffect(effect: AudioEffectTypes) {
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
    }
  }

  mixEffects(
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) {
    this.audioEffects?.updateEffects(effects);
  }

  removeMixEffects(effects: AudioMixEffectsType[]) {
    this.audioEffects?.removeEffects(effects);
  }

  samplerEffectsChange(
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) {
    this.audioEffects?.fgSampler.updateEffects(effects);
  }

  removeSamplerEffects(effects: AudioMixEffectsType[]) {
    this.audioEffects?.fgSampler.removeEffects(effects);
  }

  playNote(note: string, isPress: boolean) {
    this.audioEffects.fgSampler.playNote(note, isPress);
  }

  swapSampler(
    sampler: { category: string; kind: string },
    increment?: number
  ): FgSamplers {
    return this.audioEffects.fgSampler.swapSampler(sampler, increment);
  }

  muteMic(isMuted: boolean) {
    this.audioEffects.setMicChainMute(isMuted);
  }

  // Set volume (in decibels)
  setSamplerVolume(volume: number) {
    this.audioEffects.fgSampler.setVolume(volume);
  }

  getStream() {
    return this.mediaStream;
  }

  getTracks() {
    return this.mediaStream.getAudioTracks();
  }

  getMasterTrack() {
    return this.masterMediaStreamDestination.stream.getAudioTracks()[0];
  }

  getMasterStream() {
    return this.masterMediaStream;
  }

  getMicTrack() {
    return this.micMediaStreamDestination.stream.getAudioTracks()[0];
  }

  getSamplerTrack() {
    return this.samplerMediaStreamDestination.stream.getAudioTracks()[0];
  }
}

export default AudioMedia;
