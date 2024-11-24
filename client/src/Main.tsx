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
import onRouterCapabilities from "./lib/onRouterCapabilities";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import UserDevice from "./lib/UserDevice";
import BrowserMedia from "./lib/BrowserMedia";
import BundlesController from "./bundlesController";
import onStatesPermissionsRequested from "./lib/onStatesPermissionsRequested";
import Deadbanding from "./babylon/Deadbanding";
import FgMetaData from "./lib/FgMetaData";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";
import FgTable from "./fgTable/FgTable";
import FgTableFunctions from "./fgTableFunctions/FgTableFunctions";
import "./scrollbar.css";

const websocketURL = "http://localhost:8000";

type MediasoupSocketEvents =
  | {
      type: "routerCapabilities";
      rtpCapabilities: mediasoup.types.RtpCapabilities;
    }
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
                producerId: string;
                id: string;
                kind: "audio" | "video" | undefined;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rtpParameters: any;
                type: string;
                producerPaused: boolean;
              };
            };
            screen?: {
              [screenId: string]: {
                producerId: string;
                id: string;
                kind: "audio" | "video" | undefined;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rtpParameters: any;
                type: string;
                producerPaused: boolean;
              };
            };
            audio?: {
              producerId: string;
              id: string;
              kind: "audio" | "video" | undefined;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rtpParameters: any;
              type: string;
              producerPaused: boolean;
            };
            json?: {
              [dataStreamType in DataStreamTypes]?: {
                producerId: string;
                id: string;
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
      consumerId?: string;
      consumerType: "camera" | "screen" | "audio";
      data: {
        producerId: string;
        id: string;
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
      consumerId?: string;
      consumerType: "json";
      data: {
        producerId: string;
        id: string;
        label: string;
        sctpStreamParameters: SctpStreamParameters;
        type: string;
        producerPaused: boolean;
        protocol: string;
      };
    }
  | { type: "newProducer"; producerType: "camera" | "screen" | "audio" }
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
      producerType: "camera" | "screen" | "audio";
      producerId: string;
    }
  | {
      type: "statesPermissionsRequested";
      inquiringUsername: string;
      inquiringInstance: string;
    }
  | {
      type: "requestedCatchUpData";
      inquiringUsername: string;
      inquiringInstance: string;
      inquiredType: "camera" | "screen" | "audio";
      inquiredVideoId: string;
    };

export default function Main() {
  const {
    userMedia,
    userCameraCount,
    userScreenCount,
    userStreamEffects,
    remoteStreamEffects,
    remoteTracksMap,
    remoteDataStreams,
    userDataStreams,
  } = useStreamsContext();
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();

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

  const subBtnRef = useRef<HTMLButtonElement>(null);
  const isSubscribed = useRef(false);

  const remoteVideosContainerRef = useRef<HTMLDivElement>(null);

  const permissions = useRef({
    acceptsCameraEffects: true,
    acceptsScreenEffects: true,
    acceptsAudioEffects: true,
    acceptsPositionScaleRotationManipulation: true,
  });
  const acceptCameraEffects = true;
  const acceptScreenEffects = true;
  const acceptAudioEffects = true;

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
      case "routerCapabilities":
        onRouterCapabilities(event, device);
        break;
      case "producerTransportCreated":
        producers.onProducerTransportCreated(event);
        break;
      case "consumerTransportCreated":
        consumers.onConsumerTransportCreated(event);
        break;
      case "resumed":
        break;
      case "subscribed":
        consumers.onSubscribed(event);
        break;
      case "newConsumerSubscribed":
        consumers.onNewConsumerSubscribed(event);
        break;
      case "newJSONConsumerSubscribed":
        consumers.onNewJSONConsumerSubscribed(event);
        break;
      case "newProducer":
        producers.createNewProducer(event.producerType);
        break;
      case "newProducerAvailable":
        producers.onNewProducerAvailable(event);
        break;
      case "newJSONProducerAvailable":
        producers.onNewJSONProducerAvailable(event);
        break;
      case "producerDisconnected":
        producers.onProducerDisconnected(event);
        break;
      case "statesPermissionsRequested":
        onStatesPermissionsRequested(
          event,
          socket,
          table_id,
          username,
          instance,
          mutedAudioRef,
          acceptCameraEffects,
          acceptScreenEffects,
          acceptAudioEffects,
          userStreamEffects,
          currentEffectsStyles
        );
        break;
      case "requestedCatchUpData":
        fgMetaData.onRequestedCatchUpData(event);
        break;
      default:
        break;
    }
  };

  const setUpEffectContext = (
    username: string,
    instance: string,
    cameraIds: (string | undefined)[],
    screenIds: (string | undefined)[]
  ) => {
    if (!remoteStreamEffects.current[username]) {
      remoteStreamEffects.current[username] = {};
    }
    if (!remoteStreamEffects.current[username][instance]) {
      remoteStreamEffects.current[username][instance] = {
        camera: {},
        screen: {},
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
  };

  useEffect(() => {
    socket.current.on("message", handleMessage);

    // Handle user disconnect
    socket.current.on(
      "userDisconnected",
      (disconnectedUsername: string, disconnectedInstance: string) => {
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
            Object.keys(remoteTracksMap.current[disconnectedUsername])
              .length === 0
          ) {
            delete remoteTracksMap.current[disconnectedUsername];
          }
        }
      }
    );

    // Handle user left table
    socket.current.on(
      "userLeftTable",
      (leftUsername: string, leftInstance: string) => {
        setBundles((prev) => {
          const updatedBundles = { ...prev };
          if (updatedBundles[leftUsername]) {
            delete updatedBundles[leftUsername][leftInstance];
          }
          return updatedBundles;
        });

        if (
          remoteTracksMap.current[leftUsername] &&
          remoteTracksMap.current[leftUsername][leftInstance]
        ) {
          delete remoteTracksMap.current[leftUsername][leftInstance];

          if (Object.keys(remoteTracksMap.current[leftUsername]).length === 0) {
            delete remoteTracksMap.current[leftUsername];
          }
        }
      }
    );

    return () => {
      socket.current.off("connect");
      socket.current.off("message", handleMessage);
      socket.current.off("userDisconnected");
    };
  }, [socket]);

  const bundlesController = new BundlesController(
    socket,
    table_id,
    username,
    instance,
    userMedia,
    remoteVideosContainerRef,
    isCamera,
    isScreen,
    isAudio,
    bundles,
    setBundles,
    muteAudio,
    setUpEffectContext,
    acceptCameraEffects,
    acceptScreenEffects,
    acceptAudioEffects
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

  const producers = new Producers(
    socket,
    device,
    table_id,
    username,
    instance,
    userMedia,
    currentEffectsStyles,
    userStreamEffects,
    remoteTracksMap,
    userDataStreams,
    userCameraCount,
    userScreenCount,
    isCamera,
    isScreen,
    isAudio,
    isSubscribed,
    handleDisableEnableBtns,
    producerTransport,
    setScreenActive,
    setCameraActive,
    bundlesController.createProducerBundle,
    setBundles,
    userDevice,
    deadbanding,
    browserMedia
  );

  const consumers = new Consumers(
    socket,
    device,
    table_id,
    username,
    instance,
    subBtnRef,
    consumerTransport,
    remoteTracksMap,
    setUpEffectContext,
    bundlesController.createConsumerBundle,
    remoteDataStreams
  );

  const fgMetaData = new FgMetaData(
    table_id,
    username,
    instance,
    socket,
    userMedia
  );

  return (
    <div className='w-screen h-screen flex-col'>
      <div className='flex justify-center min-w-full bg-black h-16 text-white items-center mb-10'>
        Mediasoup Video Sharing App
      </div>
      <div
        className='flex-col flex-wrap px-5 w-full'
        style={{ height: "calc(100% - 6.5rem)" }}
      >
        <FgTableFunctions
          table_id={table_id}
          username={username}
          instance={instance}
          socket={socket}
          device={device}
          producers={producers}
          producerTransport={producerTransport}
          consumerTransport={consumerTransport}
          setBundles={setBundles}
          acceptAudioEffects={acceptAudioEffects}
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
          subBtnRef={subBtnRef}
          muteAudio={muteAudio}
          handleDisableEnableBtns={handleDisableEnableBtns}
        />
        <FgTable
          remoteVideosContainerRef={remoteVideosContainerRef}
          bundles={bundles}
        />
      </div>
    </div>
  );
}
