import React, { useEffect, useRef, useState } from "react";
import { types } from "mediasoup-client";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import { useToolsContext } from "../context/toolsContext/ToolsContext";
import { useSignalContext } from "../context/signalContext/SignalContext";
import { useUploadDownloadContext } from "../context/uploadDownloadContext/UploadDownloadContext";
import JoinTableSectionController from "./lib/JoinTableSectionController";
import ProducersController from "../lib/ProducersController";
import BundlesController from "../lib/BundlesController";
import ConsumersController from "../lib/ConsumersController";
import PermissionsController from "../lib/PermissionsController";
import Metadata from "../lib/Metadata";
import CleanupController from "../lib/CleanupController";
import Deadbanding from "../babylon/Deadbanding";

export default function JoinTableSection({
  producerTransport,
  consumerTransport,
  setBundles,
  isCamera,
  setCameraActive,
  isScreen,
  setScreenActive,
  setMutedAudio,
  mutedAudioRef,
  isAudio,
  setAudioActive,
  isSubscribed,
  handleDisableEnableBtns,
  bundlesController,
  producersController,
  consumersController,
  permissionsController,
  metadata,
  deadbanding,
  cleanupController,
  setRerender,
}: {
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
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  isScreen: React.MutableRefObject<boolean>;
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  setMutedAudio: React.Dispatch<React.SetStateAction<boolean>>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  isSubscribed: React.MutableRefObject<boolean>;
  handleDisableEnableBtns: (disabled: boolean) => void;
  bundlesController: React.MutableRefObject<BundlesController>;
  producersController: React.MutableRefObject<ProducersController>;
  consumersController: React.MutableRefObject<ConsumersController>;
  permissionsController: React.MutableRefObject<PermissionsController>;
  metadata: React.MutableRefObject<Metadata>;
  deadbanding: React.MutableRefObject<Deadbanding>;
  cleanupController: React.MutableRefObject<CleanupController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia, staticContentMedia, remoteMedia, userDataStreams } =
    useMediaContext();
  const { staticContentEffects, staticContentEffectsStyles } =
    useEffectsContext();
  const {
    mediasoupSocket,
    tableSocket,
    tableStaticContentSocket,
    videoSocket,
    liveTextEditingSocket,
    gamesSocket,
  } = useSocketContext();
  const { tableId, username, instance, device } = useUserInfoContext();
  const { userDevice } = useToolsContext();
  const { sendDownloadSignal, addCurrentDownload, removeCurrentDownload } =
    useUploadDownloadContext();
  const { sendGeneralSignal } = useSignalContext();

  const [isInTable, setIsInTable] = useState(false);
  const tableIdRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const tableFunctionsController = useRef(
    new JoinTableSectionController(
      tableSocket,
      liveTextEditingSocket,
      tableStaticContentSocket,
      videoSocket,
      mediasoupSocket,
      gamesSocket,
      tableIdRef,
      usernameRef,
      tableId,
      username,
      instance,
      setIsInTable,
      userMedia,
      staticContentMedia,
      userDataStreams,
      remoteMedia,
      staticContentEffects,
      staticContentEffectsStyles,
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
      device,
      bundlesController,
      producersController,
      consumersController,
      permissionsController,
      metadata,
      userDevice,
      deadbanding,
      cleanupController,
      setRerender,
      sendDownloadSignal,
      addCurrentDownload,
      removeCurrentDownload,
      sendGeneralSignal,
    ),
  );

  useEffect(() => {
    mediasoupSocket.current?.addMessageListener(
      tableFunctionsController.current.handleMediasoupSocketMessage,
    );

    return () => {
      mediasoupSocket.current?.removeMessageListener(
        tableFunctionsController.current.handleMediasoupSocketMessage,
      );
    };
  }, [mediasoupSocket.current]);

  return (
    <div className="mt-5 flex justify-center">
      <input
        ref={tableIdRef}
        id="tableIdyInputField"
        type="text"
        className="mr-2 border border-gray-400 px-4 py-2"
        placeholder="Enter room name"
      />
      <input
        ref={usernameRef}
        id="usernameInputField"
        type="text"
        className="mr-2 border border-gray-400 px-4 py-2"
        placeholder="Enter username"
      />
      <button
        onClick={tableFunctionsController.current.joinTable}
        className={`${
          isInTable
            ? "bg-orange-500 hover:bg-orange-700"
            : "bg-blue-500 hover:bg-blue-700"
        } max-h-[42px] px-4 py-2 font-Josefin font-bold text-fg-white`}
      >
        {isInTable ? "Join New Room" : "Join Room"}
      </button>
    </div>
  );
}
