import React, { useState, useRef, useEffect } from "react";
import { types } from "mediasoup-client";
import { useMediaContext } from "./context/mediaContext/MediaContext";
import { useEffectsContext } from "./context/effectsContext/EffectsContext";
import {
  defaultAudioEffects,
  defaultCameraEffects,
  defaultScreenEffects,
  defaultAudioEffectsStyles,
  defaultCameraEffectsStyles,
  defaultScreenEffectsStyles,
} from "../../universal/effectsTypeConstant";
import { usePermissionsContext } from "./context/permissionsContext/PermissionsContext";
import { useSocketContext } from "./context/socketContext/SocketContext";
import { useToolsContext } from "./context/toolsContext/ToolsContext";
import { useUploadDownloadContext } from "./context/uploadDownloadContext/UploadDownloadContext";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import BrowserMedia from "./media/BrowserMedia";
import BundlesController from "./lib/BundlesController";
import Deadbanding from "./babylon/Deadbanding";
import Metadata from "./lib/Metadata";
import Table from "./table/Table";
import TableFunctions from "./tableFunctions/TableFunctions";
import PermissionsController from "./lib/PermissionsController";
import CleanupController from "./lib/CleanupController";
import JoinTableSection from "./joinTableSection/JoinTableSection";
import { useUserInfoContext } from "./context/userInfoContext/UserInfoContext";
import "./css/scrollbar.css";
import "./css/fontStyles.css";
import "./css/tips.css";
import UserStaticContentSocketController from "./serverControllers/userStaticContentServer/UserStaticContentSocketController";
import Uploader from "./tools/uploader/Uploader";
import CreditPage from "./creditPage/CreditPage";
import TableLittleBuddies from "./components/tableLittleBuddies/TableLittleBuddies";
import { useSignalContext } from "./context/signalContext/SignalContext";

export default function Main() {
  const { userMedia, remoteMedia, remoteDataStreams, userDataStreams } =
    useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userEffects,
    remoteEffects,
    captureEffectsStyles,
  } = useEffectsContext();
  const { permissions } = usePermissionsContext();
  const { mediasoupSocket, userStaticContentSocket } = useSocketContext();
  const { userId, tableId, username, instance, device } = useUserInfoContext();
  const { uploader, userDevice, indexedDBController, reasonableFileSizer } =
    useToolsContext();
  const {
    sendUploadSignal,
    addCurrentUpload,
    removeCurrentUpload,
    sendDownloadSignal,
    addCurrentDownload,
    removeCurrentDownload,
  } = useUploadDownloadContext();
  const { sendGeneralSignal } = useSignalContext();

  const [bundles, setBundles] = useState<{
    [username: string]: { [instance: string]: React.JSX.Element };
  }>({});

  const consumerTransport = useRef<types.Transport<types.AppData>>();
  const producerTransport = useRef<types.Transport<types.AppData>>();

  const cameraBtnRef = useRef<HTMLButtonElement>(null);
  const newCameraBtnRef = useRef<HTMLButtonElement>(null);
  const isCamera = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);

  const screenBtnRef = useRef<HTMLButtonElement>(null);
  const newScreenBtnRef = useRef<HTMLButtonElement>(null);
  const isScreen = useRef(false);
  const [screenActive, setScreenActive] = useState(false);

  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const mutedAudioRef = useRef(false);
  const [_mutedAudio, setMutedAudio] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);

  const isSubscribed = useRef(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const tableTopRef = useRef<HTMLDivElement>(null);

  const [gridActive, setGridActive] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 4, cols: 4 });

  const [_, setRerender] = useState(false);

  const tableFunctionsRef = useRef<HTMLDivElement>(null);

  const signIn = (signedInUserId: string) => {
    userId.current = signedInUserId;

    userStaticContentSocket.current = new UserStaticContentSocketController(
      "wss://localhost:8049",
      userId.current,
      instance.current,
      userMedia,
      userStaticContentSocket,
      sendDownloadSignal,
      addCurrentDownload,
      removeCurrentDownload,
    );

    uploader.current = new Uploader(
      tableId,
      userId,
      sendUploadSignal,
      addCurrentUpload,
      removeCurrentUpload,
      reasonableFileSizer,
      indexedDBController,
      sendGeneralSignal,
    );
  };

  useEffect(() => {
    signIn("hi");
  }, []);

  const muteAudio = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => {
    if (producerType === "audio") {
      setMutedAudio((prev) => !prev);
      mutedAudioRef.current = !mutedAudioRef.current;

      if (userMedia.current.audio) {
        userMedia.current.audio.muteMic(mutedAudioRef.current);
      }
    } else if (producerId === "screenAudio") {
      if (producerId && userMedia.current.screenAudio[producerId]) {
        userMedia.current.screenAudio[producerId].toggleMute();
      }
    }

    mediasoupSocket.current?.sendMessage({
      type: "clientMute",
      header: {
        tableId: tableId.current,
        username: username.current,
        instance: instance.current,
        producerType,
        producerId,
      },
      data: {
        clientMute:
          producerType === "audio"
            ? mutedAudioRef.current
            : userMedia.current.screenAudio[producerId ?? ""].muted,
      },
    });
  };

  const handleDisableEnableBtns = (disabled: boolean) => {
    if (cameraBtnRef.current) cameraBtnRef.current.disabled = disabled;
    if (screenBtnRef.current) screenBtnRef.current.disabled = disabled;
    if (audioBtnRef.current) audioBtnRef.current.disabled = disabled;
    if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = disabled;
    if (newScreenBtnRef.current) newScreenBtnRef.current.disabled = disabled;
  };

  const setUpEffectContext = (
    username: string,
    instance: string,
    cameraIds: (string | undefined)[],
    screenIds: (string | undefined)[],
    screenAudioIds: (string | undefined)[],
  ) => {
    if (!remoteEffects.current[username]) {
      remoteEffects.current[username] = {};
    }
    if (!remoteEffects.current[username][instance]) {
      remoteEffects.current[username][instance] = {
        camera: {},
        screen: {},
        screenAudio: {},
        audio: structuredClone(defaultAudioEffects),
      };
    }

    if (!remoteEffectsStyles.current[username]) {
      remoteEffectsStyles.current[username] = {};
    }
    if (!remoteEffectsStyles.current[username][instance]) {
      remoteEffectsStyles.current[username][instance] = {
        camera: {},
        screen: {},
        screenAudio: {},
        audio: structuredClone(defaultAudioEffectsStyles),
        video: {},
        image: {},
        svg: {},
        application: {},
        soundClip: {},
      };
    }

    for (const cameraId of cameraIds) {
      if (!cameraId) {
        return;
      }

      remoteEffects.current[username][instance].camera[cameraId] =
        structuredClone(defaultCameraEffects);

      if (!remoteEffectsStyles.current[username][instance].camera[cameraId]) {
        remoteEffectsStyles.current[username][instance].camera[cameraId] =
          structuredClone(defaultCameraEffectsStyles);
      }
    }

    for (const screenId of screenIds) {
      if (!screenId) {
        return;
      }

      remoteEffects.current[username][instance].screen[screenId] =
        structuredClone(defaultScreenEffects);

      if (!remoteEffectsStyles.current[username][instance].screen[screenId]) {
        remoteEffectsStyles.current[username][instance].screen[screenId] =
          structuredClone(defaultScreenEffectsStyles);
      }
    }

    for (const screenAudioId of screenAudioIds) {
      if (!screenAudioId) {
        return;
      }

      remoteEffects.current[username][instance].screenAudio[screenAudioId] =
        structuredClone(defaultAudioEffects);

      if (
        !remoteEffectsStyles.current[username][instance].screenAudio[
          screenAudioId
        ]
      ) {
        remoteEffectsStyles.current[username][instance].screenAudio[
          screenAudioId
        ] = structuredClone(defaultAudioEffectsStyles);
      }
    }
  };

  const cleanupController = useRef(
    new CleanupController(
      remoteMedia,
      remoteDataStreams,
      remoteEffects,
      remoteEffectsStyles,
      setBundles,
    ),
  );

  const bundlesController = useRef(
    new BundlesController(
      mediasoupSocket,
      tableId,
      username,
      instance,
      userMedia,
      tableRef,
      isCamera,
      isScreen,
      isAudio,
      bundles,
      setBundles,
      muteAudio,
      setUpEffectContext,
      permissions,
      handleDisableEnableBtns,
      setAudioActive,
    ),
  );

  const deadbanding = useRef(
    new Deadbanding(userEffectsStyles, captureEffectsStyles),
  );

  const browserMedia = useRef(
    new BrowserMedia(
      device,
      userMedia,
      isCamera,
      setCameraActive,
      isScreen,
      setScreenActive,
      isAudio,
      setAudioActive,
      handleDisableEnableBtns,
      sendGeneralSignal,
    ),
  );

  const producersController = useRef(
    new ProducersController(
      mediasoupSocket,
      device,
      tableId,
      username,
      instance,
      permissions,
      userMedia,
      userEffectsStyles,
      remoteEffectsStyles,
      userEffects,
      remoteEffects,
      remoteMedia,
      userDataStreams,
      remoteDataStreams,
      isCamera,
      isScreen,
      isAudio,
      isSubscribed,
      handleDisableEnableBtns,
      producerTransport,
      setCameraActive,
      setScreenActive,
      setAudioActive,
      bundlesController.current.createProducerBundle,
      bundles,
      setBundles,
      userDevice,
      deadbanding,
      browserMedia,
    ),
  );

  const consumersController = useRef(
    new ConsumersController(
      mediasoupSocket,
      device,
      tableId,
      username,
      instance,
      consumerTransport,
      remoteMedia,
      remoteDataStreams,
      setUpEffectContext,
      bundlesController.current.createConsumerBundle,
    ),
  );

  const metadata = useRef(
    new Metadata(
      mediasoupSocket,
      tableId,
      username,
      instance,
      userMedia,
      mutedAudioRef,
      userEffects,
      userEffectsStyles,
    ),
  );

  const permissionsController = useRef(
    new PermissionsController(
      mediasoupSocket,
      tableId,
      username,
      instance,
      permissions,
    ),
  );

  return (
    // <CreditPage />
    <div className="flex h-screen w-screen flex-col space-y-[1.5%] overflow-hidden bg-fg-tone-black-1 p-[1.5%]">
      {/* <TableLittleBuddies /> */}
      <Table
        tableFunctionsRef={tableFunctionsRef}
        tableRef={tableRef}
        tableTopRef={tableTopRef}
        bundles={bundles}
        gridActive={gridActive}
        gridSize={gridSize}
      />
      <TableFunctions
        tableFunctionsRef={tableFunctionsRef}
        tableTopRef={tableTopRef}
        isCamera={isCamera}
        cameraActive={cameraActive}
        setCameraActive={setCameraActive}
        cameraBtnRef={cameraBtnRef}
        newCameraBtnRef={newCameraBtnRef}
        isScreen={isScreen}
        screenActive={screenActive}
        setScreenActive={setScreenActive}
        screenBtnRef={screenBtnRef}
        newScreenBtnRef={newScreenBtnRef}
        mutedAudioRef={mutedAudioRef}
        isAudio={isAudio}
        audioActive={audioActive}
        setAudioActive={setAudioActive}
        audioBtnRef={audioBtnRef}
        muteAudio={muteAudio}
        handleDisableEnableBtns={handleDisableEnableBtns}
        gridActive={gridActive}
        setGridActive={setGridActive}
        gridSize={gridSize}
        setGridSize={setGridSize}
        producersController={producersController}
        deadbanding={deadbanding}
      />
      <JoinTableSection
        producerTransport={producerTransport}
        consumerTransport={consumerTransport}
        setBundles={setBundles}
        isCamera={isCamera}
        setCameraActive={setCameraActive}
        isScreen={isScreen}
        setScreenActive={setScreenActive}
        setMutedAudio={setMutedAudio}
        mutedAudioRef={mutedAudioRef}
        isAudio={isAudio}
        setAudioActive={setAudioActive}
        isSubscribed={isSubscribed}
        handleDisableEnableBtns={handleDisableEnableBtns}
        bundlesController={bundlesController}
        producersController={producersController}
        consumersController={consumersController}
        permissionsController={permissionsController}
        metadata={metadata}
        deadbanding={deadbanding}
        cleanupController={cleanupController}
        setRerender={setRerender}
      />
    </div>
  );
}
