import * as mediasoup from "mediasoup-client";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

const leaveTable = (
  userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
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
      [username: string]: { [instance: string]: React.JSX.Element };
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
  for (const cameraId in userMedia.current.camera) {
    userMedia.current.camera[cameraId].deconstructor();
    delete userMedia.current.camera[cameraId];
  }
  userCameraCount.current = 0;

  for (const screenId in userMedia.current.screen) {
    userMedia.current.screen[screenId].deconstructor();
    delete userMedia.current.screen[screenId];
  }
  userScreenCount.current = 0;

  if (userMedia.current.audio) {
    userMedia.current.audio.deconstructor();
    userMedia.current.audio = undefined;
  }

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
