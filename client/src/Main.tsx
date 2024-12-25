import React, { useState, useRef, useEffect } from "react";
import { types, Device } from "mediasoup-client";
import { RtpParameters } from "mediasoup-client/lib/RtpParameters";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";
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
import { DataStreamTypes } from "./context/mediaContext/typeConstant";
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

export type MediasoupSocketEvents =
  | onProducerTransportCreatedType
  | onConsumerTransportCreatedType
  | onResumedType
  | onSubscribedType
  | onNewConsumerSubscribedType
  | onNewJSONConsumerSubscribedType
  | onNewProducerAvailableType
  | onNewJSONProducerAvailableType
  | onProducerDisconnectedType
  | onPermissionsRequestedType
  | onBundleMetadataRequestedType
  | onRequestedCatchUpDataType
  | onRemoveProducerRequestedType;

export type onProducerTransportCreatedType = {
  type: "producerTransportCreated";
  data: {
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
    };
  };
  error?: unknown;
};

export type onConsumerTransportCreatedType = {
  type: "consumerTransportCreated";
  data: {
    params: {
      id: string;
      iceParameters: types.IceParameters;
      iceCandidates: types.IceCandidate[];
      dtlsParameters: types.DtlsParameters;
    };
  };
  error?: unknown;
};

export type onResumedType = { type: "resumed" };

export type onSubscribedType = {
  type: "subscribed";
  data: {
    [username: string]: {
      [instance: string]: {
        camera?: {
          [cameraId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screen?: {
          [screenId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rtpParameters: any;
            type: string;
            producerPaused: boolean;
          };
        };
        screenAudio?: {
          [screenAudioId: string]: {
            id: string;
            producerId: string;
            kind: "audio" | "video" | undefined;
            rtpParameters: RtpParameters;
            type: string;
            producerPaused: boolean;
          };
        };
        audio?: {
          id: string;
          producerId: string;
          kind: "audio" | "video" | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rtpParameters: any;
          type: string;
          producerPaused: boolean;
        };
        json?: {
          [dataStreamType in DataStreamTypes]?: {
            id: string;
            producerId: string;
            label: string;
            sctpStreamParameters: SctpStreamParameters;
            type: string;
            producerPaused: boolean;
            protocol: string;
          };
        };
      };
    };
  };
};

export type onNewConsumerSubscribedType = {
  type: "newConsumerSubscribed";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio";
  };
  data: {
    id: string;
    producerId: string;
    kind: "audio" | "video" | undefined;
    rtpParameters: types.RtpParameters;
    type: string;
    producerPaused: boolean;
  };
};

export type onNewJSONConsumerSubscribedType = {
  type: "newJSONConsumerSubscribed";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerId?: string;
    producerType: "json";
  };
  data: {
    id: string;
    producerId: string;
    label: string;
    sctpStreamParameters: SctpStreamParameters;
    type: string;
    producerPaused: boolean;
    protocol: string;
  };
};

export type onNewProducerAvailableType = {
  type: "newProducerAvailable";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: string;
    producerId?: string;
  };
};

export type onNewJSONProducerAvailableType = {
  type: "newJSONProducerAvailable";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: string;
    producerId: string;
    dataStreamType: DataStreamTypes;
  };
};

export type onProducerDisconnectedType = {
  type: "producerDisconnected";
  header: {
    producerUsername: string;
    producerInstance: string;
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId: string;
    dataStreamType?: DataStreamTypes;
  };
};

export type onPermissionsRequestedType = {
  type: "permissionsRequested";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
  };
};

export type onBundleMetadataRequestedType = {
  type: "bundleMetadataRequested";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
  };
};

export type onRequestedCatchUpDataType = {
  type: "requestedCatchUpData";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredType: "camera" | "screen" | "audio";
    inquiredProducerId: string;
  };
};

export type onRemoveProducerRequestedType = {
  type: "removeProducerRequested";
  header: {
    producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
    producerId: string;
  };
};

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
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });

  const muteAudio = () => {
    setMutedAudio((prev) => !prev);
    mutedAudioRef.current = !mutedAudioRef.current;

    if (userMedia.current.audio) {
      userMedia.current.audio.muteMic(mutedAudioRef.current);
    }

    const msg = {
      type: "clientMute",
      header: {
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
      },
      data: {
        clientMute: mutedAudioRef.current,
      },
    };
    mediasoupSocket.current.emit("message", msg);
  };

  const handleDisableEnableBtns = (disabled: boolean) => {
    if (cameraBtnRef.current) cameraBtnRef.current.disabled = disabled;
    if (screenBtnRef.current) screenBtnRef.current.disabled = disabled;
    if (audioBtnRef.current) audioBtnRef.current.disabled = disabled;
    if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = disabled;
    if (newScreenBtnRef.current) newScreenBtnRef.current.disabled = disabled;
  };

  const handleMessage = (event: MediasoupSocketEvents) => {
    switch (event.type) {
      case "producerTransportCreated":
        producersController.onProducerTransportCreated(event);
        break;
      case "consumerTransportCreated":
        consumersController.onConsumerTransportCreated(event);
        break;
      case "resumed":
        break;
      case "subscribed":
        consumersController.onSubscribed(event);
        break;
      case "newConsumerSubscribed":
        consumersController.onNewConsumerSubscribed(event);
        break;
      case "newJSONConsumerSubscribed":
        consumersController.onNewJSONConsumerSubscribed(event);
        break;
      case "newProducerAvailable":
        producersController.onNewProducerAvailable(event);
        break;
      case "newJSONProducerAvailable":
        producersController.onNewJSONProducerAvailable(event);
        break;
      case "producerDisconnected":
        producersController.onProducerDisconnected(event);
        break;
      case "permissionsRequested":
        permissionsController.onPermissionsRequested(event);
        break;
      case "bundleMetadataRequested":
        metadata.onBundleMetadataRequested(event);
        break;
      case "requestedCatchUpData":
        metadata.onRequestedCatchUpData(event);
        break;
      case "removeProducerRequested":
        producersController.onRemoveProducerRequested(event);
        break;
      default:
        break;
    }
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

  const handleUserLeftCleanup = (
    disconnectedUsername: string,
    disconnectedInstance: string
  ) => {
    setBundles((prev) => {
      const updatedBundles = { ...prev };
      if (updatedBundles[disconnectedUsername]) {
        delete updatedBundles[disconnectedUsername][disconnectedInstance];
      }
      return updatedBundles;
    });

    if (
      remoteMedia.current[disconnectedUsername] &&
      remoteMedia.current[disconnectedUsername][disconnectedInstance]
    ) {
      delete remoteMedia.current[disconnectedUsername][disconnectedInstance];

      if (Object.keys(remoteMedia.current[disconnectedUsername]).length === 0) {
        delete remoteMedia.current[disconnectedUsername];
      }
    }

    if (
      remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ] !== undefined
    ) {
      remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ].positionScaleRotation?.close();
      delete remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ].positionScaleRotation;
      delete remoteDataStreams.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(remoteDataStreams.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete remoteDataStreams.current?.[disconnectedUsername];
      }
    }

    if (
      remoteStreamEffects.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ] !== undefined
    ) {
      delete remoteStreamEffects.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(remoteStreamEffects.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete remoteStreamEffects.current?.[disconnectedUsername];
      }
    }

    if (
      remoteEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ]
    ) {
      delete remoteEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(remoteEffectsStyles.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete remoteEffectsStyles.current?.[disconnectedUsername];
      }
    }
  };

  useEffect(() => {
    mediasoupSocket.current.on("message", handleMessage);

    // Handle user disconnect
    mediasoupSocket.current.on(
      "userDisconnected",
      (disconnectedUsername: string, disconnectedInstance: string) => {
        handleUserLeftCleanup(disconnectedUsername, disconnectedInstance);
      }
    );

    // Handle user left table
    mediasoupSocket.current.on(
      "userLeftTable",
      (leftUsername: string, leftInstance: string) => {
        handleUserLeftCleanup(leftUsername, leftInstance);
      }
    );

    return () => {
      mediasoupSocket.current.off("connect");
      mediasoupSocket.current.off("message", handleMessage);
      mediasoupSocket.current.off("userDisconnected");
    };
  }, [mediasoupSocket.current]);

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
    table_id,
    username,
    instance,
    mediasoupSocket,
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
      <FgTableFunctions
        table_id={table_id}
        username={username}
        instance={instance}
        device={device}
        producersController={producersController}
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
