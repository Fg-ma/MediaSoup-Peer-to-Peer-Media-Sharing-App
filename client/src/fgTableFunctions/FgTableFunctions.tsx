import React, { Suspense, useEffect, useRef, useState } from "react";
import { types } from "mediasoup-client";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { usePermissionsContext } from "../context/permissionsContext/PermissionsContext";
import { AudioEffectTypes } from "../context/effectsContext/typeConstant";
import { useSocketContext } from "../context/socketContext/SocketContext";
import CameraSection from "./lib/cameraSection/CameraSection";
import AudioSection from "./lib/audioSection/AudioSection";
import ScreenSection from "./lib/screenSection/ScreenSection";
import GamesSection from "./lib/gamesSection/GamesSection";
import ProducersController from "../lib/ProducersController";
import TableFunctionsController from "./lib/TableFunctionsController";
import BundlesController from "../lib/BundlesController";
import FgBackgroundSelector from "../fgElements/fgBackgroundSelector/FgBackgroundSelector";
import { FgBackground } from "../fgElements/fgBackgroundSelector/lib/typeConstant";
import TableGridSection from "./lib/tableGridButton/TableGridSection";
import ConsumersController from "../lib/ConsumersController";
import PermissionsController from "../lib/PermissionsController";
import Metadata from "../lib/Metadata";
import CleanupController from "../lib/CleanupController";
import UploadMediaButton from "./lib/uploadMediaButton/UploadMediaButton";
import UserDevice from "../lib/UserDevice";
import Deadbanding from "../babylon/Deadbanding";
import MoreTableFunctionsButton from "./lib/MoreTableFunctionsButton";

const AudioEffectsButton = React.lazy(
  () => import("../audioEffectsButton/AudioEffectsButton")
);

export default function FgTableFunctions({
  table_id,
  username,
  instance,
  device,
  tableTopRef,
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
  mutedAudioRef,
  isAudio,
  audioActive,
  setAudioActive,
  audioBtnRef,
  muteAudio,
  handleDisableEnableBtns,
  gridActive,
  setGridActive,
  gridSize,
  setGridSize,
  producersController,
}: {
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
  device: React.MutableRefObject<types.Device | undefined>;
  tableTopRef: React.RefObject<HTMLDivElement>;
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
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  audioActive: boolean;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  audioBtnRef: React.RefObject<HTMLButtonElement>;
  muteAudio: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
  ) => void;
  handleDisableEnableBtns: (disabled: boolean) => void;
  gridActive: boolean;
  setGridActive: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: {
    rows: number;
    cols: number;
  };
  setGridSize: React.Dispatch<
    React.SetStateAction<{
      rows: number;
      cols: number;
    }>
  >;
  producersController: ProducersController;
}) {
  const { userMedia } = useMediaContext();
  const { setSignal } = useSignalContext();
  const { permissions } = usePermissionsContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();

  const externalBackgroundChange = useRef(false);

  const muteBtnRef = useRef<HTMLButtonElement>(null);

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

  const [tableBackground, setTableBackground] = useState<
    FgBackground | undefined
  >();

  const tableFunctionsController = new TableFunctionsController(
    externalBackgroundChange,
    setTableBackground
  );

  const handleExternalMute = () => {
    muteAudio("audio", undefined);

    setSignal({
      type: "localMuteChange",
      header: {
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
        producerType: "audio",
        producerId: undefined,
      },
    });
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
      mediasoupSocket.current?.sendMessage({
        type: "clientEffectChange",
        header: {
          table_id: table_id.current,
          username: username.current,
          instance: instance.current,
          producerType,
          producerId,
        },
        data: {
          effect: effect,
          blockStateChange: false,
        },
      });
    }
  };

  useEffect(() => {
    setAudioEffectsActive(false);
  }, [isAudio.current]);

  useEffect(() => {
    tableSocket.current?.addMessageListener(
      tableFunctionsController.handleTableSocketMessage
    );

    return () => {
      tableSocket.current?.removeMessageListener(
        tableFunctionsController.handleTableSocketMessage
      );
    };
  }, [tableSocket.current]);

  return (
    <div className='w-full h-16 flex items-center justify-center'>
      <div className='w-max h-full p-2 flex space-x-4 bg-fg-tone-black-6 rounded'>
        <MoreTableFunctionsButton />
        <CameraSection
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
        <ScreenSection
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
        <AudioSection
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
        <UploadMediaButton table_id={table_id} />
      </div>
      <GamesSection
        table_id={table_id.current}
        username={username.current}
        instance={instance.current}
      />
      <FgBackgroundSelector
        backgroundRef={tableTopRef}
        defaultActiveBackground={tableBackground}
        backgroundChangeFunction={(background: FgBackground) => {
          if (externalBackgroundChange.current) {
            externalBackgroundChange.current = false;
          } else {
            tableSocket.current?.changeTableBackground(background);
          }
        }}
      />
      <TableGridSection
        gridActive={gridActive}
        setGridActive={setGridActive}
        gridSize={gridSize}
        setGridSize={setGridSize}
      />
      {isAudio.current && (
        <Suspense fallback={<div>Loading...</div>}>
          <AudioEffectsButton
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
  );
}
