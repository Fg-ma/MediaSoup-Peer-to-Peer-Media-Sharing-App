import { UserMedia, Gain } from "tone";
import FgMic from "./FgMic";
import FgSampler from "./FgSampler";
import FgSoundEffects from "./FgSoundEffects";
import FgBackgroundMusic from "./FgBackgroundMusic";
import FgAssetSoundEffects from "./FgAssetSoundEffects";
import { AudioMixEffectsType } from "./typeConstant";
import FgAudioEffects from "./FgAudioStreamEffects";

class AudioEffects {
  private masterChain: Gain;
  private micChain: Gain | undefined;
  private audioStreamChain: Gain | undefined;
  private samplerChain: Gain;
  private soundEffectsChain: Gain;
  private backgroundMusicChain: Gain;
  private assetSoundEffectsChain: Gain;

  effects: AudioMixEffectsType[] = [
    "autoFilter",
    "autoPanner",
    "autoWah",
    "bitCrusher",
    "chebyshev",
    "chorus",
    "distortion",
    "EQ",
    "feedbackDelay",
    "freeverb",
    "JCReverb",
    "phaser",
    "pingPongDelay",
    "pitchShift",
    "reverb",
    "stereoWidener",
    "tremolo",
    "vibrato",
  ];

  fgMic: FgMic | undefined;

  fgAudioEffects: FgAudioEffects | undefined;

  fgSampler: FgSampler;

  fgSoundEffects: FgSoundEffects;

  fgBackgroundMusic: FgBackgroundMusic;

  fgAssetSoundEffects: FgAssetSoundEffects;

  constructor(
    private audioStream: UserMedia | MediaStreamAudioSourceNode,
    private masterMediaStreamDestination: MediaStreamAudioDestinationNode,
    private micMediaStreamDestination:
      | MediaStreamAudioDestinationNode
      | undefined,
    private audioStreamMediaStreamDestination:
      | MediaStreamAudioDestinationNode
      | undefined,
    private samplerMediaStreamDestination: MediaStreamAudioDestinationNode,
    private soundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode,
    private backgroundMusicMediaStreamDestination: MediaStreamAudioDestinationNode,
    private assetSoundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode
  ) {
    this.masterChain = new Gain(); // Create a Gain node for the master chain

    if (this.micMediaStreamDestination) {
      this.micChain = new Gain(); // Create a Gain node for the mic chain
    }

    if (this.audioStreamMediaStreamDestination) {
      this.audioStreamChain = new Gain(); // Create a Gain node for the mic chain
    }

    this.samplerChain = new Gain(); // Create a Gain node for the sampler chain

    this.soundEffectsChain = new Gain(); // Create a Gain node for the sound effects chain

    this.backgroundMusicChain = new Gain(); // Create a Gain node for the background music chain

    this.assetSoundEffectsChain = new Gain(); // Create a Gain node for the asset sound effects chain

    if (this.micChain) {
      this.micChain.connect(this.masterChain);
    }
    if (this.audioStreamChain) {
      this.audioStreamChain.connect(this.masterChain);
    }
    this.samplerChain.connect(this.masterChain);
    this.soundEffectsChain.connect(this.masterChain);
    this.backgroundMusicChain.connect(this.masterChain);
    this.assetSoundEffectsChain.connect(this.masterChain);
    this.masterChain.connect(this.masterMediaStreamDestination);

    if (this.micMediaStreamDestination && this.micChain) {
      this.micChain.connect(this.micMediaStreamDestination);
    }
    if (this.audioStreamMediaStreamDestination && this.audioStreamChain) {
      this.audioStreamChain.connect(this.audioStreamMediaStreamDestination);
    }
    this.samplerChain.connect(this.samplerMediaStreamDestination);
    this.soundEffectsChain.connect(this.soundEffectsMediaStreamDestination);
    this.backgroundMusicChain.connect(
      this.backgroundMusicMediaStreamDestination
    );
    this.assetSoundEffectsChain.connect(
      this.assetSoundEffectsMediaStreamDestination
    );

    if (
      this.audioStream instanceof UserMedia &&
      this.micMediaStreamDestination !== undefined &&
      this.micChain !== undefined
    ) {
      this.fgMic = new FgMic(
        this.audioStream,
        this.micMediaStreamDestination,
        this.masterChain,
        this.micChain
      );
    }

    if (
      !(this.audioStream instanceof UserMedia) &&
      this.audioStreamMediaStreamDestination !== undefined &&
      this.audioStreamChain !== undefined
    ) {
      this.fgAudioEffects = new FgAudioEffects(
        this.audioStream,
        this.audioStreamMediaStreamDestination,
        this.masterChain,
        this.audioStreamChain
      );
    }

    this.fgSampler = new FgSampler(
      this.samplerMediaStreamDestination,
      this.masterChain,
      this.samplerChain
    );

    this.fgSoundEffects = new FgSoundEffects(
      this.soundEffectsMediaStreamDestination,
      this.soundEffectsChain
    );

    this.fgBackgroundMusic = new FgBackgroundMusic(
      this.backgroundMusicMediaStreamDestination,
      this.backgroundMusicChain
    );

    this.fgAssetSoundEffects = new FgAssetSoundEffects(
      this.assetSoundEffectsMediaStreamDestination,
      this.assetSoundEffectsChain
    );
  }

  deconstructor = () => {
    this.fgBackgroundMusic.toggleAllOff();
  };
}

export default AudioEffects;
