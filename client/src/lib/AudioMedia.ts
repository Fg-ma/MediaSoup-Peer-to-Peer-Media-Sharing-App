import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import { EffectTypes } from "src/context/StreamsContext";

type AudioEffects = "robot";

class AudioMedia {
  private username: string;
  private table_id: string;

  private initAudioStream: MediaStream;

  private currentEffectsStyles: React.MutableRefObject<EffectStylesType>;
  private userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      camera?:
        | {
            [cameraId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;

  private effects: {
    [cameraEffect in AudioEffects]?: boolean;
  };

  constructor(
    username: string,
    table_id: string,
    initAudioStream: MediaStream,
    currentEffectsStyles: React.MutableRefObject<EffectStylesType>,
    userStreamEffects: React.MutableRefObject<{
      [effectType in EffectTypes]: {
        camera?:
          | {
              [cameraId: string]: boolean;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: boolean;
            }
          | undefined;
        audio?: boolean;
      };
    }>
  ) {
    this.username = username;
    this.table_id = table_id;
    this.currentEffectsStyles = currentEffectsStyles;
    this.userStreamEffects = userStreamEffects;
    this.initAudioStream = initAudioStream;

    const defaultAudioEffect = "robot";

    if (!currentEffectsStyles.current.audio) {
      currentEffectsStyles.current.audio = {};
    }

    this.effects = {};

    for (const effect in this.userStreamEffects.current) {
      const effectType = effect as keyof typeof this.userStreamEffects.current;
      if (effectType in this.effects) {
        if (userStreamEffects.current[effectType].audio) {
          this.effects[effectType] = true;
        }
      }
    }
  }

  deconstructor() {
    // End initial stream
    this.initAudioStream.getTracks().forEach((track) => track.stop());
  }

  async changeEffects(effect: AudioEffects, blockStateChange: boolean = false) {
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
