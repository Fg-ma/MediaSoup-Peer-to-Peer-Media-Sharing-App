import * as Tone from "tone";
import FgMic from "./FgMic";
import FgSampler from "./fgSampler";
import FgSoundEffects from "./fgSoundEffects";
import FgBackgroundMusic from "./fgBackgroundMusic";
import FgAssetSoundEffects from "./fgAssetSoundEffects";
import { AudioMixEffectsType } from "./typeConstant";

class AudioEffects {
  private masterChain: Tone.Gain;
  private micChain: Tone.Gain;
  private samplerChain: Tone.Gain;
  private soundEffectsChain: Tone.Gain;
  private backgroundMusicChain: Tone.Gain;
  private assetSoundEffectsChain: Tone.Gain;

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

  fgMic: FgMic;

  fgSampler: FgSampler;

  fgSoundEffects: FgSoundEffects;

  fgBackgroundMusic: FgBackgroundMusic;

  fgAssetSoundEffects: FgAssetSoundEffects;

  constructor(
    private audioStream: Tone.UserMedia,
    private masterMediaStreamDestination: MediaStreamAudioDestinationNode,
    private micMediaStreamDestination: MediaStreamAudioDestinationNode,
    private samplerMediaStreamDestination: MediaStreamAudioDestinationNode,
    private soundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode,
    private backgroundMusicMediaStreamDestination: MediaStreamAudioDestinationNode,
    private assetSoundEffectsMediaStreamDestination: MediaStreamAudioDestinationNode
  ) {
    this.masterChain = new Tone.Gain(); // Create a Gain node for the master chain

    this.micChain = new Tone.Gain(); // Create a Gain node for the mic chain

    this.samplerChain = new Tone.Gain(); // Create a Gain node for the sampler chain

    this.soundEffectsChain = new Tone.Gain(); // Create a Gain node for the sound effects chain

    this.backgroundMusicChain = new Tone.Gain(); // Create a Gain node for the background music chain

    this.assetSoundEffectsChain = new Tone.Gain(); // Create a Gain node for the asset sound effects chain

    this.micChain.connect(this.masterChain);
    this.samplerChain.connect(this.masterChain);
    this.soundEffectsChain.connect(this.masterChain);
    this.backgroundMusicChain.connect(this.masterChain);
    this.assetSoundEffectsChain.connect(this.masterChain);
    this.masterChain.connect(this.masterMediaStreamDestination);

    this.micChain.connect(this.micMediaStreamDestination);
    this.samplerChain.connect(this.samplerMediaStreamDestination);
    this.soundEffectsChain.connect(this.soundEffectsMediaStreamDestination);
    this.backgroundMusicChain.connect(
      this.backgroundMusicMediaStreamDestination
    );
    this.assetSoundEffectsChain.connect(
      this.assetSoundEffectsMediaStreamDestination
    );

    this.fgMic = new FgMic(
      this.audioStream,
      this.micMediaStreamDestination,
      this.masterChain,
      this.micChain
    );

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
