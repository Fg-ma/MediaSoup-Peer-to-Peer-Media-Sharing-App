import React, { useState, useRef, useEffect } from "react";
import * as mediasoup from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useStreamsContext } from "./context/streamsContext/StreamsContext";
import { useCurrentEffectsStylesContext } from "./context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import {
  defaultAudioCurrentEffectsStyles,
  defaultCameraCurrentEffectsStyles,
  defaultScreenCurrentEffectsStyles,
} from "./context/currentEffectsStylesContext/typeConstant";
import {
  DataStreamTypes,
  defaultAudioStreamEffects,
  defaultCameraStreamEffects,
  defaultScreenStreamEffects,
} from "./context/streamsContext/typeConstant";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import UserDevice from "./lib/UserDevice";
import BrowserMedia from "./lib/BrowserMedia";
import BundlesController from "./bundlesController";
import Deadbanding from "./babylon/Deadbanding";
import Metadata from "./lib/Metadata";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";
import FgTable from "./fgTable/FgTable";
import FgTableFunctions from "./fgTableFunctions/FgTableFunctions";
import "./scrollbar.css";
import { usePermissionsContext } from "./context/permissionsContext/PermissionsContext";
import PermissionsController from "./lib/PermissionsController";

const websocketURL = "http://localhost:8000";

type MediasoupSocketEvents =
  | {
      type: "producerTransportCreated";
      params: {
        id: string;
        iceParameters: mediasoup.types.IceParameters;
        iceCandidates: mediasoup.types.IceCandidate[];
        dtlsParameters: mediasoup.types.DtlsParameters;
      };
      error?: unknown;
    }
  | {
      type: "consumerTransportCreated";
      params: {
        id: string;
        iceParameters: mediasoup.types.IceParameters;
        iceCandidates: mediasoup.types.IceCandidate[];
        dtlsParameters: mediasoup.types.DtlsParameters;
      };
      error?: unknown;
    }
  | { type: "resumed" }
  | {
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
    }
  | {
      type: "newConsumerSubscribed";
      producerUsername: string;
      producerInstance: string;
      producerId?: string;
      producerType: "camera" | "screen" | "screenAudio" | "audio";
      data: {
        id: string;
        producerId: string;
        kind: "audio" | "video" | undefined;
        rtpParameters: mediasoup.types.RtpParameters;
        type: string;
        producerPaused: boolean;
      };
    }
  | {
      type: "newJSONConsumerSubscribed";
      producerUsername: string;
      producerInstance: string;
      producerId?: string;
      producerType: "json";
      data: {
        id: string;
        producerId: string;
        label: string;
        sctpStreamParameters: SctpStreamParameters;
        type: string;
        producerPaused: boolean;
        protocol: string;
      };
    }
  | {
      type: "newProducerAvailable";
      producerUsername: string;
      producerInstance: string;
      producerType: string;
      producerId?: string;
    }
  | {
      type: "newJSONProducerAvailable";
      producerUsername: string;
      producerInstance: string;
      producerType: string;
      producerId: string;
      dataStreamType: DataStreamTypes;
    }
  | {
      type: "producerDisconnected";
      producerUsername: string;
      producerInstance: string;
      producerType: "camera" | "screen" | "screenAudio" | "audio" | "json";
      producerId: string;
    }
  | {
      type: "permissionsRequested";
      inquiringUsername: string;
      inquiringInstance: string;
    }
  | {
      type: "bundleMetadataRequested";
      inquiringUsername: string;
      inquiringInstance: string;
    }
  | {
      type: "requestedCatchUpData";
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredType: "camera" | "screen" | "audio";
      inquiredProducerId: string;
    };

export default function Main() {
  const {
    userMedia,
    userStreamEffects,
    remoteStreamEffects,
    remoteTracksMap,
    remoteDataStreams,
    userDataStreams,
  } = useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { permissions } = usePermissionsContext();

  const socket = useRef<Socket>(io(websocketURL));
  const device = useRef<mediasoup.Device>();

  const table_id = useRef("");
  const username = useRef("");
  const instance = useRef(uuidv4());

  const [bundles, setBundles] = useState<{
    [username: string]: { [instance: string]: React.JSX.Element };
  }>({});

  const consumerTransport =
    useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();
  const producerTransport =
    useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();

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

  const muteAudio = () => {
    setMutedAudio((prev) => !prev);
    mutedAudioRef.current = !mutedAudioRef.current;

    if (userMedia.current.audio) {
      userMedia.current.audio.muteMic(mutedAudioRef.current);
    }

    const msg = {
      type: "clientMute",
      table_id: table_id.current,
      username: username.current,
      instance: instance.current,
      clientMute: mutedAudioRef.current,
    };
    socket.current.emit("message", msg);
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

    if (!remoteCurrentEffectsStyles.current[username]) {
      remoteCurrentEffectsStyles.current[username] = {};
    }
    if (!remoteCurrentEffectsStyles.current[username][instance]) {
      remoteCurrentEffectsStyles.current[username][instance] = {
        camera: {},
        screen: {},
        screenAudio: {},
        audio: structuredClone(defaultAudioCurrentEffectsStyles),
      };
    }

    for (const cameraId of cameraIds) {
      if (!cameraId) {
        return;
      }

      remoteStreamEffects.current[username][instance].camera[cameraId] =
        structuredClone(defaultCameraStreamEffects);

      if (
        !remoteCurrentEffectsStyles.current[username][instance].camera[cameraId]
      ) {
        remoteCurrentEffectsStyles.current[username][instance].camera[
          cameraId
        ] = structuredClone(defaultCameraCurrentEffectsStyles);
      }
    }

    for (const screenId of screenIds) {
      if (!screenId) {
        return;
      }

      remoteStreamEffects.current[username][instance].screen[screenId] =
        structuredClone(defaultScreenStreamEffects);

      if (
        !remoteCurrentEffectsStyles.current[username][instance].screen[screenId]
      ) {
        remoteCurrentEffectsStyles.current[username][instance].screen[
          screenId
        ] = structuredClone(defaultScreenCurrentEffectsStyles);
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
        !remoteCurrentEffectsStyles.current[username][instance].screenAudio[
          screenAudioId
        ]
      ) {
        remoteCurrentEffectsStyles.current[username][instance].screenAudio[
          screenAudioId
        ] = structuredClone(defaultAudioCurrentEffectsStyles);
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
      remoteTracksMap.current[disconnectedUsername] &&
      remoteTracksMap.current[disconnectedUsername][disconnectedInstance]
    ) {
      delete remoteTracksMap.current[disconnectedUsername][
        disconnectedInstance
      ];

      if (
        Object.keys(remoteTracksMap.current[disconnectedUsername]).length === 0
      ) {
        delete remoteTracksMap.current[disconnectedUsername];
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
      remoteCurrentEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ] !== undefined
    ) {
      delete remoteCurrentEffectsStyles.current?.[disconnectedUsername]?.[
        disconnectedInstance
      ];

      if (
        Object.keys(remoteCurrentEffectsStyles.current?.[disconnectedUsername])
          .length === 0
      ) {
        delete remoteCurrentEffectsStyles.current?.[disconnectedUsername];
      }
    }
  };

  useEffect(() => {
    socket.current.on("message", handleMessage);

    // Handle user disconnect
    socket.current.on(
      "userDisconnected",
      (disconnectedUsername: string, disconnectedInstance: string) => {
        handleUserLeftCleanup(disconnectedUsername, disconnectedInstance);
      }
    );

    // Handle user left table
    socket.current.on(
      "userLeftTable",
      (leftUsername: string, leftInstance: string) => {
        handleUserLeftCleanup(leftUsername, leftInstance);
      }
    );

    return () => {
      socket.current.off("connect");
      socket.current.off("message", handleMessage);
      socket.current.off("userDisconnected");
    };
  }, [socket.current]);

  const bundlesController = new BundlesController(
    socket,
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

  const deadbanding = new Deadbanding(currentEffectsStyles);

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
    socket,
    device,
    table_id,
    username,
    instance,
    userMedia,
    currentEffectsStyles,
    remoteCurrentEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
    remoteTracksMap,
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
    socket,
    device,
    table_id,
    username,
    instance,
    consumerTransport,
    remoteTracksMap,
    remoteDataStreams,
    setUpEffectContext,
    bundlesController.createConsumerBundle
  );

  const metadata = new Metadata(
    table_id,
    username,
    instance,
    socket,
    userMedia,
    mutedAudioRef,
    userStreamEffects,
    currentEffectsStyles
  );

  const permissionsController = new PermissionsController(
    socket,
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
        socket={socket}
        device={device}
        producersController={producersController}
        producerTransport={producerTransport}
        consumerTransport={consumerTransport}
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
      />
      <FgTable tableRef={tableRef} bundles={bundles} />
    </div>
  );
}
