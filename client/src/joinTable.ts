import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import leaveTable from "./leaveTable";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

const joinTable = (
  socket: React.MutableRefObject<Socket>,
  tableIdRef: React.RefObject<HTMLInputElement>,
  usernameRef: React.RefObject<HTMLInputElement>,
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  instance: React.MutableRefObject<string>,
  setIsInTable: React.Dispatch<React.SetStateAction<boolean>>,
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
  device: React.MutableRefObject<mediasoup.types.Device | undefined>
) => {
  const previousTableId = table_id.current;
  const previousUsername = username.current;

  if (
    table_id.current === tableIdRef.current?.value &&
    username.current === usernameRef.current?.value
  ) {
    return;
  }

  if (tableIdRef.current) {
    table_id.current = tableIdRef.current?.value;
  }
  if (usernameRef.current) {
    username.current = usernameRef.current?.value;
  }
  if (table_id.current.trim() !== "" && username.current.trim() !== "") {
    // Leave previous table if there is one
    if (previousTableId.trim() !== "" && previousUsername.trim() !== "") {
      socket.current.emit(
        "leaveTable",
        previousTableId,
        previousUsername,
        instance.current
      );
      leaveTable(
        userMedia,
        userCameraCount,
        userScreenCount,
        remoteTracksMap,
        handleDisableEnableBtns,
        setBundles,
        consumerTransport,
        producerTransport,
        isCamera,
        setCameraActive,
        isScreen,
        setScreenActive,
        isAudio,
        setAudioActive,
        setMutedAudio,
        mutedAudioRef,
        setSubscribedActive,
        isSubscribed,
        setIsInTable,
        device
      );
    }

    // Join new table
    socket.current.emit(
      "joinTable",
      table_id.current,
      username.current,
      instance.current
    );
    setIsInTable(true);
  }
};

export default joinTable;
