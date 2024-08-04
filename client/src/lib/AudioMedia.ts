import * as Tone from "tone";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import AudioEffects, {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../effects/audioEffects/AudioEffects";

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

    this.audioEffects = new AudioEffects(this.audioStream);

    this.effects = {};
  }

  async openMic() {
    await this.audioStream.open();

    // Fix this it is janky way of getting mic started
    this.audioEffects.applyReverbEffect();
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
              { option: "oversample", value: 4 }, // 4x oversampling
            ],
          },
          {
            type: "pitchShift",
            updates: [
              { option: "pitch", value: -6 }, // Lower pitch for a robotic tone
            ],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 5 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 500 },
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
            type: "delay",
            updates: [
              { option: "delayTime", value: 0.5 },
              { option: "feedback", value: 0.4 },
            ],
          },
        ]);
        break;
      case "alien":
        this.audioEffects?.updateEffects([
          {
            type: "pitchShift",
            updates: [
              { option: "pitch", value: 12 }, // High pitch
            ],
          },
          {
            type: "phaser",
            updates: [
              { option: "frequency", value: 10 },
              { option: "octaves", value: 3 },
              { option: "baseFrequency", value: 1000 },
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
            updates: [
              { option: "high", value: -12 }, // Reduce high frequencies
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
        ]);
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
        ]);
        break;
      case "echo":
        this.audioEffects?.removeEffects(["reverb", "delay"]);
        break;
      case "alien":
        this.audioEffects?.removeEffects(["pitchShift", "phaser"]);
        break;
      case "underwater":
        this.audioEffects?.removeEffects(["reverb", "EQ"]);
        break;
      case "telephone":
        this.audioEffects?.removeEffects(["EQ", "distortion"]);
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

  getStream() {
    return this.mediaStreamDestination?.stream;
  }

  getTrack() {
    return this.mediaStreamDestination?.stream.getAudioTracks()[0];
  }
}

export default AudioMedia;
