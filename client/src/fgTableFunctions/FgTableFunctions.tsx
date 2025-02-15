import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import CameraSection from "./lib/cameraSection/CameraSection";
import AudioSection from "./lib/audioSection/AudioSection";
import ScreenSection from "./lib/screenSection/ScreenSection";
import ProducersController from "../lib/ProducersController";
import TableFunctionsController from "./lib/TableFunctionsController";
import { FgBackground } from "../elements/fgBackgroundSelector/lib/typeConstant";
import UploadMediaButton from "./lib/uploadMediaButton/UploadMediaButton";
import MoreTableFunctionsButton from "./lib/moreTableFunctionsButton/MoreTableFunctionsButton";
import MessageTableSection from "./lib/messageTableSection/MessageTableSection";

export default function FgTableFunctions({
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
  const { setSignal } = useSignalContext();
  const { tableSocket } = useSocketContext();
  const { table_id, username, instance } = useUserInfoContext();

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
    <div className='w-full h-16 flex items-center justify-center space-x-5 px-[5%]'>
      <div className='w-max h-full py-2 px-4 flex space-x-3 bg-fg-tone-black-6 rounded-xl border-2 border-fg-off-white'>
        <MoreTableFunctionsButton
          tableTopRef={tableTopRef}
          mutedAudioRef={mutedAudioRef}
          isAudio={isAudio}
          gridActive={gridActive}
          setGridActive={setGridActive}
          gridSize={gridSize}
          setGridSize={setGridSize}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          tableBackground={tableBackground}
          externalBackgroundChange={externalBackgroundChange}
          handleExternalMute={handleExternalMute}
        />
        <CameraSection
          cameraBtnRef={cameraBtnRef}
          newCameraBtnRef={newCameraBtnRef}
          isCamera={isCamera}
          setCameraActive={setCameraActive}
          cameraActive={cameraActive}
          producersController={producersController}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <ScreenSection
          screenBtnRef={screenBtnRef}
          newScreenBtnRef={newScreenBtnRef}
          isScreen={isScreen}
          screenActive={screenActive}
          setScreenActive={setScreenActive}
          producersController={producersController}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <AudioSection
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
        <UploadMediaButton />
      </div>
      <MessageTableSection />
    </div>
  );
}
