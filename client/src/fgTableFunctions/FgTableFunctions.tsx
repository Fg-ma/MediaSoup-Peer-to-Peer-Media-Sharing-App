import React, { Suspense, useEffect, useRef, useState } from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useStreamsContext } from "../context/streamsContext/StreamsContext";
import CameraSection from "./lib/cameraSection/CameraSection";
import AudioSection from "./lib/audioSection/AudioSection";
import { AudioEffectTypes } from "../context/streamsContext/typeConstant";
import ScreenSection from "./lib/screenSection/ScreenSection";
import Producers from "../lib/Producers";
import TableFunctionsController from "./lib/TableFunctionsController";
import { usePermissionsContext } from "../context/permissionsContext/PermissionsContext";

const AudioEffectsButton = React.lazy(
  () => import("../audioEffectsButton/AudioEffectsButton")
);

export default function FgTableFunctions({
  table_id,
  username,
  instance,
  socket,
  device,
  producers,
  producerTransport,
  consumerTransport,
  setBundles,
  isCamera,
  cameraActive,
  setCameraActive,
  cameraBtnRef,
  newCameraBtnRef,
  isScreen,
  screenActive,
  setScreenActive,
  screenBtnRef,
  newScreenBtnRef,
  setMutedAudio,
  mutedAudioRef,
  isAudio,
  audioActive,
  setAudioActive,
  audioBtnRef,
  isSubscribed,
  subBtnRef,
  muteAudio,
  handleDisableEnableBtns,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  socket: React.MutableRefObject<Socket>;
  device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  producers: Producers;
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >;
  setBundles: React.Dispatch<
    React.SetStateAction<{
      [username: string]: {
        [instance: string]: React.JSX.Element;
      };
    }>
  >;
  isCamera: React.MutableRefObject<boolean>;
  cameraActive: boolean;
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  cameraBtnRef: React.RefObject<HTMLButtonElement>;
  newCameraBtnRef: React.RefObject<HTMLButtonElement>;
  isScreen: React.MutableRefObject<boolean>;
  screenActive: boolean;
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  screenBtnRef: React.RefObject<HTMLButtonElement>;
  newScreenBtnRef: React.RefObject<HTMLButtonElement>;
  setMutedAudio: React.Dispatch<React.SetStateAction<boolean>>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  audioActive: boolean;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  audioBtnRef: React.RefObject<HTMLButtonElement>;
  isSubscribed: React.MutableRefObject<boolean>;
  subBtnRef: React.RefObject<HTMLButtonElement>;
  muteAudio: () => void;
  handleDisableEnableBtns: (disabled: boolean) => void;
}) {
  const { userMedia, userCameraCount, userScreenCount, remoteTracksMap } =
    useStreamsContext();
  const { setSignal } = useSignalContext();
  const { permissions } = usePermissionsContext();

  const [subscribedActive, setSubscribedActive] = useState(false);

  const muteBtnRef = useRef<HTMLButtonElement>(null);

  const tableIdRef = useRef<HTMLInputElement>(null);
  const [isInTable, setIsInTable] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const tableFunctionsController = new TableFunctionsController(
    socket,
    tableIdRef,
    usernameRef,
    table_id,
    username,
    instance,
    setIsInTable,
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
    device,
    subBtnRef
  );

  const handleExternalMute = () => {
    muteAudio();

    const msg: {
      type: "localMuteChange";
      table_id: string;
      username: string;
      instance: string;
    } = {
      type: "localMuteChange",
      table_id: table_id.current,
      username: username.current,
      instance: instance.current,
    };

    setSignal(msg);
  };

  const handleExternalAudioEffectChange = (effect: AudioEffectTypes) => {
    userMedia.current.audio?.changeEffects(effect, false);

    if (permissions.current.acceptsAudioEffects) {
      const msg = {
        type: "clientEffectChange",
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
        producerType: "audio",
        producerId: undefined,
        effect: effect,
        effectStyle: undefined,
        blockStateChange: false,
      };

      socket.current.emit("message", msg);
    }
  };

  useEffect(() => {
    setAudioEffectsActive(false);
  }, [isAudio.current]);

  return (
    <>
      <div className='flex items-center justify-center'>
        <CameraSection
          socket={socket}
          device={device}
          table_id={table_id}
          username={username}
          instance={instance}
          cameraBtnRef={cameraBtnRef}
          newCameraBtnRef={newCameraBtnRef}
          isCamera={isCamera}
          isScreen={isScreen}
          isAudio={isAudio}
          setCameraActive={setCameraActive}
          cameraActive={cameraActive}
          producers={producers}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <AudioSection
          socket={socket}
          device={device}
          table_id={table_id}
          username={username}
          instance={instance}
          audioBtnRef={audioBtnRef}
          muteBtnRef={muteBtnRef}
          mutedAudioRef={mutedAudioRef}
          isCamera={isCamera}
          isScreen={isScreen}
          isAudio={isAudio}
          audioActive={audioActive}
          setAudioActive={setAudioActive}
          handleExternalMute={handleExternalMute}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <ScreenSection
          socket={socket}
          device={device}
          table_id={table_id}
          username={username}
          instance={instance}
          screenBtnRef={screenBtnRef}
          newScreenBtnRef={newScreenBtnRef}
          isCamera={isCamera}
          isScreen={isScreen}
          isAudio={isAudio}
          screenActive={screenActive}
          setScreenActive={setScreenActive}
          producers={producers}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <div className='flex flex-col mx-2'>
          <button
            ref={subBtnRef}
            onClick={tableFunctionsController.subscribe}
            className={`${
              subscribedActive
                ? "bg-orange-500 hover:bg-orange-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-3 disabled:opacity-25`}
          >
            {subscribedActive ? "Unsubscribe" : "Subscribe"}
          </button>
        </div>
        {isAudio.current && (
          <Suspense fallback={<div>Loading...</div>}>
            <AudioEffectsButton
              socket={socket}
              username={username.current}
              instance={instance.current}
              isUser={true}
              audioEffectsActive={audioEffectsActive}
              setAudioEffectsActive={setAudioEffectsActive}
              handleAudioEffectChange={handleExternalAudioEffectChange}
              handleMute={handleExternalMute}
              muteStateRef={mutedAudioRef}
              options={{ color: "black", placement: "below" }}
            />
          </Suspense>
        )}
      </div>
      <div className='flex justify-center mt-5'>
        <input
          ref={tableIdRef}
          id='tableIdyInputField'
          type='text'
          className='border border-gray-400 px-4 py-2 mr-2'
          placeholder='Enter room name'
        />
        <input
          ref={usernameRef}
          id='usernameInputField'
          type='text'
          className='border border-gray-400 px-4 py-2 mr-2'
          placeholder='Enter username'
        />
        <button
          onClick={() => {
            tableFunctionsController.joinTable();

            const msg = {
              type: "getRouterRtpCapabilities",
              table_id: table_id.current,
              username: username.current,
              instance: instance.current,
            };
            socket.current.emit("message", msg);
          }}
          className={`${
            isInTable
              ? "bg-orange-500 hover:bg-orange-700"
              : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 max-h-[42px]`}
        >
          {isInTable ? "Join New Room" : "Join Room"}
        </button>
      </div>
    </>
  );
}
