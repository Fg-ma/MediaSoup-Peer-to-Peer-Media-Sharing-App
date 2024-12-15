import React, { Suspense, useEffect, useRef, useState } from "react";
import { types } from "mediasoup-client";
import { Socket } from "socket.io-client";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../context/permissionsContext/PermissionsContext";
import { AudioEffectTypes } from "../context/effectsContext/typeConstant";
import CameraSection from "./lib/cameraSection/CameraSection";
import AudioSection from "./lib/audioSection/AudioSection";
import ScreenSection from "./lib/screenSection/ScreenSection";
import GamesSection from "./lib/gamesSection/GamesSection";
import ProducersController from "../lib/ProducersController";
import TableFunctionsController from "./lib/TableFunctionsController";
import onRouterCapabilities from "../lib/onRouterCapabilities";

const AudioEffectsButton = React.lazy(
  () => import("../audioEffectsButton/AudioEffectsButton")
);

export default function FgTableFunctions({
  table_id,
  username,
  instance,
  socket,
  device,
  producersController,
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
  muteAudio,
  handleDisableEnableBtns,
  bundles,
  createProducerBundle,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  socket: React.MutableRefObject<Socket>;
  device: React.MutableRefObject<types.Device | undefined>;
  producersController: ProducersController;
  producerTransport: React.MutableRefObject<
    types.Transport<types.AppData> | undefined
  >;
  consumerTransport: React.MutableRefObject<
    types.Transport<types.AppData> | undefined
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
  muteAudio: () => void;
  handleDisableEnableBtns: (disabled: boolean) => void;
  bundles: {
    [username: string]: {
      [instance: string]: React.JSX.Element;
    };
  };
  createProducerBundle: () => void;
}) {
  const { userMedia, remoteTracksMap, userDataStreams } = useMediaContext();
  const { setSignal } = useSignalContext();
  const { permissions } = usePermissionsContext();

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
    userDataStreams,
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
    isSubscribed,
    device
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

  const handleExternalAudioEffectChange = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => {
    if (producerType === "audio") {
      userMedia.current.audio?.changeEffects(effect, false);
    } else if (producerType === "screenAudio" && producerId) {
      userMedia.current.screenAudio[producerId].changeEffects(effect, false);
    }

    if (permissions.current.acceptsAudioEffects) {
      const msg = {
        type: "clientEffectChange",
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
        producerType,
        producerId,
        effect: effect,
        blockStateChange: false,
      };

      socket.current.emit("message", msg);
    }
  };

  useEffect(() => {
    setAudioEffectsActive(false);
  }, [isAudio.current]);

  const handleMessage = async (event: {
    type: "routerCapabilities";
    rtpCapabilities: types.RtpCapabilities;
  }) => {
    switch (event.type) {
      case "routerCapabilities":
        await onRouterCapabilities(event, device);

        tableFunctionsController.subscribe();
        tableFunctionsController.createProducerTransport();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    socket.current.on("message", handleMessage);

    return () => {
      socket.current.off("message", handleMessage);
    };
  }, [socket.current]);

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
          setCameraActive={setCameraActive}
          cameraActive={cameraActive}
          producersController={producersController}
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
          isAudio={isAudio}
          audioActive={audioActive}
          setAudioActive={setAudioActive}
          handleExternalMute={handleExternalMute}
          producersController={producersController}
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
          isScreen={isScreen}
          screenActive={screenActive}
          setScreenActive={setScreenActive}
          producersController={producersController}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <GamesSection
          table_id={table_id.current}
          username={username.current}
          instance={instance.current}
          bundles={bundles}
          createProducerBundle={createProducerBundle}
        />
        {isAudio.current && (
          <Suspense fallback={<div>Loading...</div>}>
            <AudioEffectsButton
              socket={socket}
              table_id={table_id.current}
              username={username.current}
              instance={instance.current}
              isUser={true}
              permissions={permissions.current}
              producerType={"audio"}
              producerId={undefined}
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
