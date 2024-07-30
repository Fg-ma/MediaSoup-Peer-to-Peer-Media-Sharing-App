import AudioMedia from "src/lib/AudioMedia";
import CameraMedia from "src/lib/CameraMedia";
import ScreenMedia from "src/lib/ScreenMedia";

const onNewProducerWasCreated = (
  event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
  },
  isUser: boolean,
  setCameraStreams: React.Dispatch<
    React.SetStateAction<
      | {
          [cameraId: string]: MediaStream;
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
  userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>
) => {
  if (!isUser) {
    return;
  }

  if (event.producerType === "camera") {
    setCameraStreams((prev) => {
      const newStreams = { ...prev };
      if (event.producerId) {
        newStreams[event.producerId] =
          userMedia.current.camera[event.producerId].getStream();
      }
      return newStreams;
    });
  } else if (event.producerType === "screen") {
    setScreenStreams((prev) => {
      const newStreams = { ...prev };
      if (event.producerId) {
        newStreams[event.producerId] =
          userMedia.current.screen[event.producerId].getStream();
      }
      return newStreams;
    });
  } else if (event.producerType === "audio") {
    setAudioStream(userMedia.current.audio?.getStream());
  }
};

export default onNewProducerWasCreated;
