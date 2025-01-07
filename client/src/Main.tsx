import React, { useState, useRef } from "react";
import { types, Device } from "mediasoup-client";
import { v4 as uuidv4 } from "uuid";
import { useMediaContext } from "./context/mediaContext/MediaContext";
import { useEffectsContext } from "./context/effectsContext/EffectsContext";
import {
  defaultAudioStreamEffects,
  defaultCameraStreamEffects,
  defaultScreenStreamEffects,
  defaultAudioEffectsStyles,
  defaultCameraEffectsStyles,
  defaultScreenEffectsStyles,
} from "./context/effectsContext/typeConstant";
import { usePermissionsContext } from "./context/permissionsContext/PermissionsContext";
import { useSocketContext } from "./context/socketContext/SocketContext";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import UserDevice from "./lib/UserDevice";
import BrowserMedia from "./lib/BrowserMedia";
import BundlesController from "./lib/BundlesController";
import Deadbanding from "./babylon/Deadbanding";
import Metadata from "./lib/Metadata";
import FgTable from "./fgTable/FgTable";
import FgTableFunctions from "./fgTableFunctions/FgTableFunctions";
import PermissionsController from "./lib/PermissionsController";
import "./scrollbar.css";
import CleanupController from "./lib/CleanupController";
import Upload from "./Upload";
import FileReceiver from "./FileReceiver";

export default function Main() {
  const { userMedia, remoteMedia, remoteDataStreams, userDataStreams } =
    useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();
  const { permissions } = usePermissionsContext();
  const { mediasoupSocket } = useSocketContext();

  const device = useRef<Device>();

  const table_id = useRef("");
  const username = useRef("");
  const instance = useRef(uuidv4());

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
  const [_, setMutedAudio] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);

  const isSubscribed = useRef(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const tableTopRef = useRef<HTMLDivElement>(null);

  const [gridActive, setGridActive] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 15, cols: 15 });

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
    } else {
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
    if (!remoteStreamEffects.current[username]) {
      remoteStreamEffects.current[username] = {};
    }
    if (!remoteStreamEffects.current[username][instance]) {
      remoteStreamEffects.current[username][instance] = {
        camera: {},
        screen: {},
        screenAudio: {},
        audio: structuredClone(defaultAudioStreamEffects),
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
      };
    }

    for (const cameraId of cameraIds) {
      if (!cameraId) {
        return;
      }

      remoteStreamEffects.current[username][instance].camera[cameraId] =
        structuredClone(defaultCameraStreamEffects);

      if (!remoteEffectsStyles.current[username][instance].camera[cameraId]) {
        remoteEffectsStyles.current[username][instance].camera[cameraId] =
          structuredClone(defaultCameraEffectsStyles);
      }
    }

    for (const screenId of screenIds) {
      if (!screenId) {
        return;
      }

      remoteStreamEffects.current[username][instance].screen[screenId] =
        structuredClone(defaultScreenStreamEffects);

      if (!remoteEffectsStyles.current[username][instance].screen[screenId]) {
        remoteEffectsStyles.current[username][instance].screen[screenId] =
          structuredClone(defaultScreenEffectsStyles);
      }
    }

    for (const screenAudioId of screenAudioIds) {
      if (!screenAudioId) {
        return;
      }

      remoteStreamEffects.current[username][instance].screenAudio[
        screenAudioId
      ] = structuredClone(defaultAudioStreamEffects);

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
    remoteStreamEffects,
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
    permissions
  );

  const userDevice = new UserDevice();

  const deadbanding = new Deadbanding(userEffectsStyles);

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
    userStreamEffects,
    remoteStreamEffects,
    remoteMedia,
    userDataStreams,
    remoteDataStreams,
    isCamera,
    isScreen,
    isSubscribed,
    handleDisableEnableBtns,
    producerTransport,
    setScreenActive,
    setCameraActive,
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
    userStreamEffects,
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
    <div className='w-screen h-screen flex-col space-y-3 flex-wrap p-5 overflow-hidden'>
      <Upload />
      <FileReceiver />
      <FgTableFunctions
        table_id={table_id}
        username={username}
        instance={instance}
        device={device}
        producerTransport={producerTransport}
        consumerTransport={consumerTransport}
        tableTopRef={tableTopRef}
        setBundles={setBundles}
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
        setMutedAudio={setMutedAudio}
        mutedAudioRef={mutedAudioRef}
        isAudio={isAudio}
        audioActive={audioActive}
        setAudioActive={setAudioActive}
        audioBtnRef={audioBtnRef}
        isSubscribed={isSubscribed}
        muteAudio={muteAudio}
        handleDisableEnableBtns={handleDisableEnableBtns}
        bundles={bundles}
        bundlesController={bundlesController}
        gridActive={gridActive}
        setGridActive={setGridActive}
        gridSize={gridSize}
        setGridSize={setGridSize}
        producersController={producersController}
        consumersController={consumersController}
        permissionsController={permissionsController}
        metadata={metadata}
        cleanupController={cleanupController}
      />
      <FgTable
        tableRef={tableRef}
        tableTopRef={tableTopRef}
        bundles={bundles}
        gridActive={gridActive}
        gridSize={gridSize}
      />
    </div>
  );
}
