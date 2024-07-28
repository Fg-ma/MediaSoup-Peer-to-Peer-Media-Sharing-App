import * as mediasoup from "mediasoup-client";

const leaveTable = (
  userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenCount: React.MutableRefObject<number>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?:
        | {
            [cameraId: string]: MediaStreamTrack;
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
    React.SetStateAction<{
      [username: string]: React.JSX.Element;
    }>
  >,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  isCamera: React.MutableRefObject<boolean>,
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
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
  for (const cameraId in userStreams.current.camera) {
    userStreams.current.camera[cameraId]
      ?.getTracks()
      .forEach((track) => track.stop());
    delete userStreams.current.camera[cameraId];
  }
  userCameraCount.current = 0;

  for (const screenId in userStreams.current.screen) {
    userStreams.current.screen[screenId]
      ?.getTracks()
      .forEach((track) => track.stop());
    delete userStreams.current.screen[screenId];
  }
  userScreenCount.current = 0;

  userStreams.current.audio?.getTracks().forEach((track) => track.stop());
  userStreams.current.audio = undefined;

  remoteTracksMap.current = {};

  handleDisableEnableBtns(false);
  device.current = undefined;
  setBundles({});
  consumerTransport.current = undefined;
  producerTransport.current = undefined;
  isCamera.current = false;
  setCameraActive(false);
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
