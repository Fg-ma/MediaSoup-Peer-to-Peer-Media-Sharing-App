import React, { useEffect, useRef, useState } from "react";
import { types } from "mediasoup-client";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useEffectsContext } from "../context/effectsContext/EffectsContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import JoinTableSectionController from "./lib/JoinTableSectionController";
import ProducersController from "../lib/ProducersController";
import BundlesController from "../lib/BundlesController";
import ConsumersController from "../lib/ConsumersController";
import PermissionsController from "../lib/PermissionsController";
import Metadata from "../lib/Metadata";
import CleanupController from "../lib/CleanupController";
import UserDevice from "../lib/UserDevice";
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
  userDevice,
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
  userDevice: React.MutableRefObject<UserDevice>;
  deadbanding: React.MutableRefObject<Deadbanding>;
  cleanupController: React.MutableRefObject<CleanupController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia, remoteMedia, userDataStreams } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { mediasoupSocket, tableSocket, tableStaticContentSocket } =
    useSocketContext();
  const { table_id, username, instance, device } = useUserInfoContext();
  const [isInTable, setIsInTable] = useState(false);
  const tableIdRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const tableFunctionsController = useRef(
    new JoinTableSectionController(
      tableSocket,
      tableStaticContentSocket,
      mediasoupSocket,
      tableIdRef,
      usernameRef,
      table_id,
      username,
      instance,
      setIsInTable,
      userMedia,
      userDataStreams,
      remoteMedia,
      userEffects,
      userEffectsStyles,
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
        } max-h-[42px] px-4 py-2 font-Josefin font-bold text-white`}
      >
        {isInTable ? "Join New Room" : "Join Room"}
      </button>
    </div>
  );
}
