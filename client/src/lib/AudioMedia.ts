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
import { Samplers } from "../effects/audioEffects/FgSampler";

class AudioMedia {
  private username: string;
  private table_id: string;

  private audioStream: Tone.UserMedia;
  private audioContext: Tone.BaseContext;
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

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
    this.mediaStreamDestination =
      this.audioContext.createMediaStreamDestination();

    // Connect the Tone.UserMedia instance to the MediaStreamDestination
    this.audioStream.connect(this.mediaStreamDestination);

    this.audioEffects = new AudioEffects(
      this.audioStream,
      this.mediaStreamDestination
    );

    this.effects = {};
  }

  openMic = async () => {
    await this.audioStream.open();

    // Fix this it is janky way of getting mic started
    this.audioEffects.updateEffects([
      {
        type: "reverb",
        updates: [
          { option: "decay", value: 1 },
          { option: "preDelay", value: 1 },
        ],
      },
    ]);
    this.audioEffects.removeEffects(["reverb"]);
  };

  deconstructor = () => {
    this.audioStream.close();
  };

  changeEffects = async (
    effect: AudioEffectTypes,
    blockStateChange: boolean = false
  ) => {
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
    }
  };

  mixEffects = (
    effects: {
      type: AudioMixEffectsType;
      updates: { option: MixEffectsOptionsType; value: number }[];
    }[]
  ) => {
    this.audioEffects?.updateEffects(effects);
  };

  removeMixEffects = (effects: AudioMixEffectsType[]) => {
    this.audioEffects?.removeEffects(effects);
  };

  playNote = (note: string, isPress: boolean) => {
    this.audioEffects.fgSampler.playNote(note, isPress);
  };

  swapSampler = (
    sampler: { category: string; kind: string },
    increment?: number
  ): Samplers => {
    return this.audioEffects.fgSampler.swapSampler(sampler, increment);
  };

  // Set volume (in decibels)
  setSamplerVolume = (volume: number) => {
    this.audioEffects.fgSampler.setVolume(volume);
  };

  getStream = () => {
    return this.mediaStreamDestination?.stream;
  };

  getTrack = () => {
    return this.mediaStreamDestination?.stream.getAudioTracks()[0];
  };
}

export default AudioMedia;
