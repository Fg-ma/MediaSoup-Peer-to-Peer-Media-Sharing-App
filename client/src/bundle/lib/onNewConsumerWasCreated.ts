const onNewConsumerWasCreated = async (
  event: {
    type: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
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
  setAudioStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?:
        | {
            [webcamId: string]: MediaStreamTrack;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: MediaStreamTrack;
          }
        | undefined;
      audio?: MediaStreamTrack | undefined;
    };
  }>
) => {
  if (username !== event.producerUsername) {
    return;
  }

  if (event.consumerType === "webcam") {
    setCameraStreams((prev) => {
      const newStreams = { ...prev };
      const newStream = new MediaStream();
      if (event.consumerId) {
        const track =
          remoteTracksMap.current[event.producerUsername].webcam?.[
            event.consumerId
          ];
        if (track) {
          newStream.addTrack(track);
        }

        newStreams[event.consumerId] = newStream;
      }
      return newStreams;
    });
  } else if (event.consumerType === "screen") {
    setScreenStreams((prev) => {
      const newStreams = { ...prev };
      const newStream = new MediaStream();
      if (event.consumerId) {
        const track =
          remoteTracksMap.current[event.producerUsername].screen?.[
            event.consumerId
          ];
        if (track) {
          newStream.addTrack(track);
        }

        newStreams[event.consumerId] = newStream;
      }
      return newStreams;
    });
  } else if (event.consumerType === "audio") {
    const newStream = new MediaStream();
    const track = remoteTracksMap.current[event.producerUsername].audio;
    if (track) {
      newStream.addTrack(track);
    }

    setAudioStream(newStream);
  }
};

export default onNewConsumerWasCreated;
