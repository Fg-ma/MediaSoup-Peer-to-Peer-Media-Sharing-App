const onProducerDisconnected = (
  event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  },
  username: string,
  setCameraStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [screenKey: string]: MediaStream;
        }
      | undefined
    >
  >,
  setScreenStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [screenKey: string]: MediaStream;
        }
      | undefined
    >
  >,
  setAudioStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>
) => {
  if (event.producerUsername === username) {
    if (event.producerType === "camera") {
      setCameraStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[event.producerId];
        return newStreams;
      });
    } else if (event.producerType === "screen") {
      setScreenStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[event.producerId];
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      setAudioStream(undefined);
    }
  }
};

export default onProducerDisconnected;
