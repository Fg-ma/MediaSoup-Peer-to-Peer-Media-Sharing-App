import * as mediasoup from "mediasoup-client";

const leaveTable = (
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  userScreenCount: React.MutableRefObject<number>,
  userAudioStream: React.MutableRefObject<MediaStream | undefined>,
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
  }>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  setBundles: React.Dispatch<
    React.SetStateAction<
      | {
          [username: string]: React.JSX.Element;
        }
      | undefined
    >
  >,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  isWebcam: React.MutableRefObject<boolean>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  isAudio: React.MutableRefObject<boolean>,
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
  setMutedAudio: React.Dispatch<React.SetStateAction<boolean>>,
  mutedAudioRef: React.MutableRefObject<boolean>,
  setSubscribedActive: React.Dispatch<React.SetStateAction<boolean>>,
  isSubscribed: React.MutableRefObject<boolean>,
  setIsInTable: React.Dispatch<React.SetStateAction<boolean>>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>
) => {
  for (const webcamId in userCameraStreams.current) {
    userCameraStreams.current[webcamId]
      ?.getTracks()
      .forEach((track) => track.stop());
    delete userCameraStreams.current[webcamId];
  }
  userCameraCount.current = 0;

  for (const webcamId in userScreenStreams.current) {
    userScreenStreams.current[webcamId]
      ?.getTracks()
      .forEach((track) => track.stop());
    delete userScreenStreams.current[webcamId];
  }
  userScreenCount.current = 0;

  userAudioStream.current?.getTracks().forEach((track) => track.stop());
  userAudioStream.current = undefined;

  remoteTracksMap.current = {};

  handleDisableEnableBtns(false);
  device.current = undefined;
  setBundles({});
  consumerTransport.current = undefined;
  producerTransport.current = undefined;
  isWebcam.current = false;
  setWebcamActive(false);
  isScreen.current = false;
  setScreenActive(false);
  isAudio.current = false;
  setAudioActive(false);
  setMutedAudio(false);
  mutedAudioRef.current = false;
  setSubscribedActive(false);
  isSubscribed.current = false;
  setIsInTable(false);
};

export default leaveTable;
