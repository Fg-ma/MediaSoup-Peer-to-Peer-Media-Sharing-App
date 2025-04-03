import React, { useState, useRef } from "react";
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
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import UserDevice from "./lib/UserDevice";
import BrowserMedia from "./media/BrowserMedia";
import BundlesController from "./lib/BundlesController";
import Deadbanding from "./babylon/Deadbanding";
import Metadata from "./lib/Metadata";
import FgTable from "./fgTable/FgTable";
import FgTableFunctions from "./fgTableFunctions/FgTableFunctions";
import PermissionsController from "./lib/PermissionsController";
import CleanupController from "./lib/CleanupController";
import JoinTableSection from "./joinTableSection/JoinTableSection";
import { useUserInfoContext } from "./context/userInfoContext/UserInfoContext";
import "./css/scrollbar.css";
import "./css/fontStyles.css";
import "./css/tips.css";
import CreditPage from "./creditPage/CreditPage";

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
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance, device } = useUserInfoContext();

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

  const [_rerender, setRerender] = useState(false);

  const muteAudio = (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined
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
        table_id: table_id.current,
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
    screenAudioIds: (string | undefined)[]
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

  const cleanupController = new CleanupController(
    remoteMedia,
    remoteDataStreams,
    remoteEffects,
    remoteEffectsStyles,
    setBundles
  );

  const bundlesController = new BundlesController(
    mediasoupSocket,
    table_id,
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
    setAudioActive
  );

  const userDevice = new UserDevice();

  const deadbanding = new Deadbanding(userEffectsStyles, captureEffectsStyles);

  const browserMedia = new BrowserMedia(
    device,
    userMedia,
    isCamera,
    setCameraActive,
    isScreen,
    setScreenActive,
    isAudio,
    setAudioActive,
    handleDisableEnableBtns
  );

  const producersController = new ProducersController(
    mediasoupSocket,
    device,
    table_id,
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
    bundlesController.createProducerBundle,
    bundles,
    setBundles,
    userDevice,
    deadbanding,
    browserMedia
  );

  const consumersController = new ConsumersController(
    mediasoupSocket,
    device,
    table_id,
    username,
    instance,
    consumerTransport,
    remoteMedia,
    remoteDataStreams,
    setUpEffectContext,
    bundlesController.createConsumerBundle
  );

  const metadata = new Metadata(
    mediasoupSocket,
    table_id,
    username,
    instance,
    userMedia,
    mutedAudioRef,
    userEffects,
    userEffectsStyles
  );

  const permissionsController = new PermissionsController(
    mediasoupSocket,
    table_id,
    username,
    instance,
    permissions
  );

  return (
    // <CreditPage />
    <div className='w-screen h-screen flex flex-col space-y-[1.5%] p-[1.5%] overflow-hidden bg-fg-tone-black-1'>
      <FgTable
        tableRef={tableRef}
        tableTopRef={tableTopRef}
        bundles={bundles}
        gridActive={gridActive}
        gridSize={gridSize}
        userDevice={userDevice}
        deadbanding={deadbanding}
      />
      <FgTableFunctions
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
        userDevice={userDevice}
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
        userDevice={userDevice}
        deadbanding={deadbanding}
        cleanupController={cleanupController}
        setRerender={setRerender}
      />
    </div>
  );
}
