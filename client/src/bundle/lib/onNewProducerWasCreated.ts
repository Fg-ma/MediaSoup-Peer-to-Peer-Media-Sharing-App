const onNewProducerWasCreated = (
  event: {
    type: string;
    producerType: "webcam" | "screen" | "audio";
  },
  isUser: boolean,
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
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  userScreenCount: React.MutableRefObject<number>,
  userAudioStream: React.MutableRefObject<MediaStream | undefined>
) => {
  if (!isUser) {
    return;
  }

  if (event.producerType === "webcam") {
    setCameraStreams((prev) => {
      const newStreams = { ...prev };
      newStreams[`${username}_camera_stream_${userCameraCount.current}`] =
        userCameraStreams.current[
          `${username}_camera_stream_${userCameraCount.current}`
        ];
      return newStreams;
    });
  } else if (event.producerType === "screen") {
    setScreenStreams((prev) => {
      const newStreams = { ...prev };
      newStreams[`${username}_screen_stream_${userScreenCount.current}`] =
        userScreenStreams.current[
          `${username}_screen_stream_${userScreenCount.current}`
        ];
      return newStreams;
    });
  } else if (event.producerType === "audio") {
    setAudioStream(userAudioStream.current);
  }
};

export default onNewProducerWasCreated;
