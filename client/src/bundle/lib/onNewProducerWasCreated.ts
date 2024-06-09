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
          [webcamId: string]: MediaStream;
        }
      | undefined
    >
  >,
  setScreenStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [screenId: string]: MediaStream;
        }
      | undefined
    >
  >,
  setAudioStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>,
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenCount: React.MutableRefObject<number>
) => {
  if (!isUser) {
    return;
  }

  if (event.producerType === "webcam") {
    setCameraStreams((prev) => {
      const newStreams = { ...prev };
      newStreams[`${username}_camera_stream_${userCameraCount.current}`] =
        userStreams.current.webcam[
          `${username}_camera_stream_${userCameraCount.current}`
        ];
      return newStreams;
    });
  } else if (event.producerType === "screen") {
    setScreenStreams((prev) => {
      const newStreams = { ...prev };
      newStreams[`${username}_screen_stream_${userScreenCount.current}`] =
        userStreams.current.screen[
          `${username}_screen_stream_${userScreenCount.current}`
        ];
      return newStreams;
    });
  } else if (event.producerType === "audio") {
    setAudioStream(userStreams.current.audio);
  }
};

export default onNewProducerWasCreated;
