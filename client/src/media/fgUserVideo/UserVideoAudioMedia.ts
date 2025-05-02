import { BaseContext, getContext, start } from "tone";
import { AudioEffectTypes } from "../../../../universal/effectsTypeConstant";
import AudioEffects from "../../audioEffects/AudioEffects";

class UserVideoAudioMedia {
  private audioSource: MediaStreamAudioSourceNode;
  private audioContext: BaseContext;
  private mediaStream: MediaStream;
  private masterMediaStream: MediaStream;

  private masterMediaStreamDestination: MediaStreamAudioDestinationNode;

  audioEffects: AudioEffects;

  muted = false;

  private effects: {
    [audioEffect in AudioEffectTypes]?: boolean;
  } = {};

  constructor(
    private videoId: string,
    private audioStream: MediaStream,
  ) {
    // Create an AudioContext and MediaStreamDestination
    this.audioContext = getContext();
    this.masterMediaStreamDestination =
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
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    // Combine both MediaStreamDestinations into a single MediaStream
    this.mediaStream = new MediaStream();

    // Add the master track (from masterMediaStreamDestination) to combined stream
    this.mediaStream.addTrack(
      this.masterMediaStreamDestination.stream.getAudioTracks()[0],
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
}

export default UserVideoAudioMedia;
