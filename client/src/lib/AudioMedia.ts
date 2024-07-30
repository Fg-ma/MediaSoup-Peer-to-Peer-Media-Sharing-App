import * as Tone from "tone";
import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";
import AudioEffects from "../effects/audioEffects/AudioEffects";

class AudioMedia {
  private username: string;
  private table_id: string;

  private audioStream: Tone.UserMedia;
  private audioContext: Tone.BaseContext;
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  private audioEffects: AudioEffects;

  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
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
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
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
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;

    this.audioStream = audioStream;

    this.openMic();

    this.audioEffects = new AudioEffects(audioStream);

    // Create an AudioContext and MediaStreamDestination
    this.audioContext = Tone.context;
    this.mediaStreamDestination =
      this.audioContext.createMediaStreamDestination();

    // Connect the Tone.UserMedia instance to the MediaStreamDestination
    this.audioStream.connect(this.mediaStreamDestination);

    this.effects = {};

    if (!currentEffectsStyles.current.audio) {
      currentEffectsStyles.current.audio = {};
    }
  }

  async openMic() {
    await this.audioStream.open();
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
        this.applyRoboticEffect();
        break;
    }
  }

  removeEffect(effect: AudioEffectTypes) {
    switch (effect) {
      case "robot":
        this.removeRoboticEffect();
        break;
    }
  }

  applyRoboticEffect() {
    this.audioEffects.applyChorusEffect();
  }

  removeRoboticEffect() {
    this.audioEffects.applyChorusEffect();
  }

  getStream() {
    return this.mediaStreamDestination?.stream;
  }

  getTrack() {
    return this.mediaStreamDestination?.stream.getAudioTracks()[0];
  }
}

export default AudioMedia;
