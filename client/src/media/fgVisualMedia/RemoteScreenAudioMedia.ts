class RemoteScreenAudioMedia {
  constructor(
    public username: string,
    public instance: string,
    public visualMediaId: string,
    public track: MediaStreamTrack,
  ) {}

  deconstructor() {}
}

export default RemoteScreenAudioMedia;
