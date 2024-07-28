import { EffectStylesType } from "../context/CurrentEffectsStylesContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/StreamsContext";

class AudioMedia {
  private username: string;
  private table_id: string;

  private initAudioStream: MediaStream;

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

  private audioContext: AudioContext;
  private source: MediaStreamAudioSourceNode;
  private gainNode: GainNode;
  private delayNode: DelayNode;

  constructor(
    username: string,
    table_id: string,
    initAudioStream: MediaStream,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    }>
  ) {
    this.username = username;
    this.table_id = table_id;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.initAudioStream = initAudioStream;

    this.effects = {};

    if (!currentEffectsStyles.current.audio) {
      currentEffectsStyles.current.audio = {};
    }

    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(
      this.initAudioStream
    );
    this.gainNode = this.audioContext.createGain();
    this.delayNode = this.audioContext.createDelay();

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.delayNode);
    this.delayNode.connect(this.audioContext.destination);
  }

  deconstructor() {
    // End initial stream
    this.initAudioStream.getTracks().forEach((track) => track.stop());

    this.audioContext.close();
  }

  async changeEffects(
    effect: AudioEffectTypes,
    blockStateChange: boolean = false
  ) {
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
    this.delayNode.delayTime.value = 0.03; // small delay to create robotic effect
    this.gainNode.gain.value = 1.5; // amplify the audio
  }

  removeRoboticEffect() {
    this.delayNode.delayTime.value = 0;
    this.gainNode.gain.value = 1;
  }

  getStream() {
    return this.initAudioStream;
  }

  getTrack() {
    return this.initAudioStream.getAudioTracks()[0];
  }
}

export default AudioMedia;
