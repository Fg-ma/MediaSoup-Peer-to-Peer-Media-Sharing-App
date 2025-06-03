class RemoteAudioMedia {
  constructor(
    public username: string,
    public instance: string,
    public track: MediaStreamTrack,
  ) {}

  deconstructor() {}
}

export default RemoteAudioMedia;
