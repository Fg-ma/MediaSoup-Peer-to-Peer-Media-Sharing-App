import React, { useState, useRef, useEffect, Suspense } from "react";
import * as mediasoup from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useStreamsContext } from "./context/streamsContext/StreamsContext";
import { useCurrentEffectsStylesContext } from "./context/currentEffectsStylesContext/CurrentEffectsStylesContext";
import { useSignalContext } from "./context/signalContext/SignalContext";
import {
  defaultAudioCurrentEffectsStyles,
  defaultCameraCurrentEffectsStyles,
  defaultScreenCurrentEffectsStyles,
} from "./context/currentEffectsStylesContext/typeConstant";
import {
  AudioEffectTypes,
  DataStreamTypes,
  defaultAudioStreamEffects,
  defaultCameraStreamEffects,
  defaultScreenStreamEffects,
} from "./context/streamsContext/typeConstant";
import onRouterCapabilities from "./lib/onRouterCapabilities";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import UserDevice from "./UserDevice";
import BrowserMedia from "./BrowserMedia";
import BundlesController from "./bundlesController";
import subscribe from "./subscribe";
import joinTable from "./joinTable";
import CameraSection from "./cameraSection/CameraSection";
import ScreenSection from "./screenSection/ScreenSection";
import AudioSection from "./audioSection/AudioSection";
import onStatesPermissionsRequested from "./lib/onStatesPermissionsRequested";
import Deadbanding from "./babylon/Deadbanding";
import FgMetaData from "./lib/FgMetaData";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";

const AudioEffectsButton = React.lazy(
  () => import("./audioEffectsButton/AudioEffectsButton")
);

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
  const { setSignal } = useSignalContext();

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
  const muteBtnRef = useRef<HTMLButtonElement>(null);
  const mutedAudioRef = useRef(false);
  const [_, setMutedAudio] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);

  const subBtnRef = useRef<HTMLButtonElement>(null);
  const [subscribedActive, setSubscribedActive] = useState(false);
  const isSubscribed = useRef(false);

  const tableIdRef = useRef<HTMLInputElement>(null);
  const [isInTable, setIsInTable] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const remoteVideosContainerRef = useRef<HTMLDivElement>(null);

  const acceptCameraEffects = true;
  const acceptScreenEffects = true;
  const acceptAudioEffects = true;

  const [audioEffectsActive, setAudioEffectsActive] = useState(false);

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

  const handleExternalMute = () => {
    muteAudio();

    const msg: {
      type: "localMuteChange";
      table_id: string;
      username: string;
      instance: string;
    } = {
      type: "localMuteChange",
      table_id: table_id.current,
      username: username.current,
      instance: instance.current,
    };

    setSignal(msg);
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

  const handleExternalAudioEffectChange = (effect: AudioEffectTypes) => {
    userMedia.current.audio?.changeEffects(effect, false);

    if (acceptAudioEffects) {
      const msg = {
        type: "clientEffectChange",
        table_id: table_id.current,
        username: username.current,
        instance: instance.current,
        producerType: "audio",
        producerId: undefined,
        effect: effect,
        effectStyle: undefined,
        blockStateChange: false,
      };

      socket.current.emit("message", msg);
    }
  };

  return (
    <div className='w-screen h-screen overflow-x-hidden flex-col'>
      <div className='flex justify-center min-w-full bg-black h-16 text-white items-center mb-10'>
        Mediasoup Video Sharing App
      </div>
      <div
        className='flex-col flex-wrap overflow-hidden px-5 w-full'
        style={{ height: "calc(100% - 6.5rem)" }}
      >
        <div className='flex items-center justify-center'>
          <CameraSection
            socket={socket}
            device={device}
            table_id={table_id}
            username={username}
            instance={instance}
            cameraBtnRef={cameraBtnRef}
            newCameraBtnRef={newCameraBtnRef}
            isCamera={isCamera}
            setCameraActive={setCameraActive}
            cameraActive={cameraActive}
            producers={producers}
            handleDisableEnableBtns={handleDisableEnableBtns}
          />
          <AudioSection
            socket={socket}
            device={device}
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
            handleDisableEnableBtns={handleDisableEnableBtns}
          />
          <ScreenSection
            socket={socket}
            device={device}
            table_id={table_id}
            username={username}
            instance={instance}
            screenBtnRef={screenBtnRef}
            newScreenBtnRef={newScreenBtnRef}
            isScreen={isScreen}
            screenActive={screenActive}
            setScreenActive={setScreenActive}
            producers={producers}
            handleDisableEnableBtns={handleDisableEnableBtns}
          />
          <div className='flex flex-col mx-2'>
            <button
              ref={subBtnRef}
              onClick={() =>
                subscribe(
                  isSubscribed,
                  subBtnRef,
                  setSubscribedActive,
                  socket,
                  table_id,
                  username,
                  instance,
                  consumerTransport,
                  remoteTracksMap,
                  setBundles
                )
              }
              className={`${
                subscribedActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {subscribedActive ? "Unsubscribe" : "Subscribe"}
            </button>
          </div>
          {isAudio.current && (
            <Suspense fallback={<div>Loading...</div>}>
              <AudioEffectsButton
                socket={socket}
                username={username.current}
                instance={instance.current}
                isUser={true}
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
        <div className='flex justify-center mt-5'>
          <input
            ref={tableIdRef}
            id='tableIdyInputField'
            type='text'
            className='border border-gray-400 px-4 py-2 mr-2'
            placeholder='Enter room name'
          />
          <input
            ref={usernameRef}
            id='usernameInputField'
            type='text'
            className='border border-gray-400 px-4 py-2 mr-2'
            placeholder='Enter username'
          />
          <button
            onClick={() => {
              joinTable(
                socket,
                tableIdRef,
                usernameRef,
                table_id,
                username,
                instance,
                setIsInTable,
                userMedia,
                userCameraCount,
                userScreenCount,
                remoteTracksMap,
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
                setSubscribedActive,
                isSubscribed,
                device
              );
              const msg = {
                type: "getRouterRtpCapabilities",
                table_id: table_id.current,
                username: username.current,
                instance: instance.current,
              };
              socket.current.emit("message", msg);
            }}
            className={`${
              isInTable
                ? "bg-orange-500 hover:bg-orange-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4`}
          >
            {isInTable ? "Join New Room" : "Join Room"}
          </button>
        </div>
        <div
          ref={remoteVideosContainerRef}
          className='relative bg-fg-white-65 rounded-md m-4'
          style={{ width: "calc(100% - 2rem)", height: "calc(100% - 10rem)" }}
        >
          {bundles &&
            Object.keys(bundles).length !== 0 &&
            Object.keys(bundles).map(
              (username) =>
                Object.keys(bundles[username]).length !== 0 &&
                Object.entries(bundles[username]).map(([key, bundle]) => (
                  <div
                    className='w-full h-full absolute top-0 left-0'
                    key={key}
                    id={`${key}_bundle`}
                  >
                    {bundle}
                  </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
