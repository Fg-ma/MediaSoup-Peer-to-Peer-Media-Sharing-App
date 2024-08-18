import React, { useState, useRef, useEffect } from "react";
import * as mediasoup from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useStreamsContext } from "./context/StreamsContext";
import { useCurrentEffectsStylesContext } from "./context/CurrentEffectsStylesContext";
import onRouterCapabilities from "./lib/onRouterCapabilities";
import Producers from "./lib/Producers";
import Consumers from "./lib/Consumers";
import UserDevice from "./UserDevice";
import Deadbanding from "./effects/visualEffects/lib/Deadbanding";
import BrowserMedia from "./BrowserMedia";
import BundlesController from "./bundlesController";
import onClientMuteStateRequested from "./lib/onClientMuteStateRequested";
import subscribe from "./subscribe";
import joinTable from "./joinTable";
import AudioEffectsButton from "./audioEffectsButton/AudioEffectsButton";
import CameraSection from "./cameraSection/CameraSection";
import ScreenSection from "./screenSection/ScreenSection";
import AudioSection from "./audioSection/AudioSection";

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
                rtpParameters: any;
                type: string;
                producerPaused: boolean;
              };
            };
            audio?: {
              producerId: string;
              id: string;
              kind: "audio" | "video" | undefined;
              rtpParameters: any;
              type: string;
              producerPaused: boolean;
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
  | { type: "newProducer"; producerType: "camera" | "screen" | "audio" }
  | {
      type: "newProducerAvailable";
      producerUsername: string;
      producerInstance: string;
      producerType: string;
      producerId?: string;
    }
  | {
      type: "producerDisconnected";
      producerUsername: string;
      producerInstance: string;
      producerType: string;
      producerId: string;
    }
  | { type: "clientMuteStateRequested"; username: string; instance: string };

export default function Main() {
  const {
    userMedia,
    userCameraCount,
    userScreenCount,
    userStreamEffects,
    remoteTracksMap,
  } = useStreamsContext();
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();

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
  const [mutedAudio, setMutedAudio] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);

  const subBtnRef = useRef<HTMLButtonElement>(null);
  const [subscribedActive, setSubscribedActive] = useState(false);
  const isSubscribed = useRef(false);

  const tableIdRef = useRef<HTMLInputElement>(null);
  const [isInTable, setIsInTable] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const remoteVideosContainerRef = useRef<HTMLDivElement>(null);

  const muteAudio = () => {
    if (userMedia.current.audio) {
      userMedia.current.audio.getTrack().enabled = mutedAudioRef.current;
    }

    setMutedAudio((prev) => !prev);
    mutedAudioRef.current = !mutedAudioRef.current;

    const msg = {
      type: "clientMute",
      table_id: table_id.current,
      username: username.current,
      instance: instance.current,
      clientMute: mutedAudioRef.current,
    };
    socket.current.emit("message", msg);
  };

  const handleMuteExternalMute = () => {
    muteAudio();

    const msg = {
      type: "sendLocalMuteChange",
      table_id: table_id.current,
      username: username.current,
      instance: instance.current,
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
      case "newProducer":
        producers.createNewProducer(event.producerType);
        break;
      case "newProducerAvailable":
        producers.onNewProducerAvailable(event);
        break;
      case "producerDisconnected":
        producers.onProducerDisconnected(event);
        break;
      case "clientMuteStateRequested":
        onClientMuteStateRequested(
          event,
          socket,
          table_id,
          username,
          instance,
          mutedAudioRef
        );
        break;
      default:
        break;
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
    muteAudio
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
    bundlesController.createConsumerBundle
  );

  return (
    <div className='min-w-full min-h-full overflow-x-hidden flex-col'>
      <div className='flex justify-center min-w-full bg-black h-16 text-white items-center mb-10'>
        Mediasoup Video Sharing App
      </div>
      <div className='flex-col flex-wrap -mx-1 overflow-hidden px-5'>
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
            handleMuteExternalMute={handleMuteExternalMute}
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
            <AudioEffectsButton
              handleMuteExternalMute={handleMuteExternalMute}
              mutedAudioRef={mutedAudioRef}
            />
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
        <div ref={remoteVideosContainerRef} className='w-full grid grid-cols-3'>
          {bundles &&
            Object.keys(bundles).length !== 0 &&
            Object.keys(bundles).map(
              (username) =>
                Object.keys(bundles[username]).length !== 0 &&
                Object.entries(bundles[username]).map(([key, bundle]) => (
                  <div key={key} id={`${key}_bundle`}>
                    {bundle}
                  </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
