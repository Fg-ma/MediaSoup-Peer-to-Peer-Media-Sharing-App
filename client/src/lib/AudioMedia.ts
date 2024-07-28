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
  }

  deconstructor() {
    // End initial stream
    this.initAudioStream.getTracks().forEach((track) => track.stop());
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
  }

  getStream() {
    return this.initAudioStream;
  }

  getTrack() {
    return this.initAudioStream.getAudioTracks()[0];
  }
}

export default AudioMedia;
