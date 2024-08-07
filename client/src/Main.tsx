import React, { useState, useRef, useEffect } from "react";
import * as mediasoup from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import publishCamera from "./publishCamera";
import publishScreen from "./publishScreen";
import onRouterCapabilities from "./lib/onRouterCapabilities";
import subscribe from "./subscribe";
import joinTable from "./joinTable";
import publishAudio from "./publishAudio";
import onClientMuteStateRequested from "./lib/onClientMuteStateRequested";
import publishNewCamera from "./publishNewCamera";
import publishNewScreen from "./publishNewScreen";
import { useStreamsContext } from "./context/StreamsContext";
import Bundle from "./bundle/Bundle";
import Producers from "./lib/Producers";
import { useCurrentEffectsStylesContext } from "./context/CurrentEffectsStylesContext";
import Consumers from "./lib/Consumers";
import UserDevice from "./UserDevice";
import Deadbanding from "./effects/visualEffects/lib/Deadbanding";
import BrowserMedia from "./BrowserMedia";
import AudioEffectsButton from "./audioEffectsButton/AudioEffectsButton";

const websocketURL = "http://localhost:8000";

export default function Main() {
  const {
    userMedia,
    userCameraCount,
    userScreenCount,
    userStreamEffects,
    remoteTracksMap,
  } = useStreamsContext();
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();

  const cameraBtnRef = useRef<HTMLButtonElement>(null);
  const newCameraBtnRef = useRef<HTMLButtonElement>(null);
  const newScreenBtnRef = useRef<HTMLButtonElement>(null);
  const screenBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const muteBtnRef = useRef<HTMLButtonElement>(null);
  const subBtnRef = useRef<HTMLButtonElement>(null);
  const tableIdRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const remoteVideosContainerRef = useRef<HTMLDivElement>(null);
  const consumerTransport =
    useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();
  const producerTransport =
    useRef<mediasoup.types.Transport<mediasoup.types.AppData>>();
  const [mutedAudio, setMutedAudio] = useState(false);
  const mutedAudioRef = useRef(false);
  const [subscribedActive, setSubscribedActive] = useState(false);
  const isSubscribed = useRef(false);
  const [isInTable, setIsInTable] = useState(false);

  const isCamera = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const isScreen = useRef(false);
  const [screenActive, setScreenActive] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);

  const table_id = useRef("");
  const username = useRef("");

  const socket = useRef<Socket>(io(websocketURL));
  const device = useRef<mediasoup.Device>();

  const [bundles, setBundles] = useState<{
    [username: string]: React.JSX.Element;
  }>({});

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
    };

    socket.current.emit("message", msg);
  };

  const handleDisableEnableBtns = (disabled: boolean) => {
    if (cameraBtnRef.current) cameraBtnRef.current!.disabled = disabled;
    if (screenBtnRef.current) screenBtnRef.current!.disabled = disabled;
    if (audioBtnRef.current) audioBtnRef.current!.disabled = disabled;
    if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = disabled;
    if (newScreenBtnRef.current) newScreenBtnRef.current.disabled = disabled;
  };

  const handleMessage = (event: any) => {
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
      case "newProducerAvailable":
        producers.onNewProducerAvailable(event);
        break;
      case "newProducer":
        producers.onNewProducer(event);
        break;
      case "producerDisconnected":
        producers.onProducerDisconnected(event);
        break;
      case "clientMuteStateRequested":
        onClientMuteStateRequested(
          event,
          socket,
          username,
          table_id,
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
    socket.current.on("userDisconnected", (disconnectedUsername: string) => {
      setBundles((prev) => {
        const updatedBundles = { ...prev };
        delete updatedBundles[disconnectedUsername];
        return updatedBundles;
      });
      delete remoteTracksMap.current[disconnectedUsername];
    });

    // Handle user left table
    socket.current.on("userLeftTable", (leftUsername: string) => {
      setBundles((prev) => {
        const updatedBundles = { ...prev };
        delete updatedBundles[leftUsername];
        return updatedBundles;
      });
      delete remoteTracksMap.current[leftUsername];
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("message", handleMessage);
      socket.current.off("userDisconnected");
    };
  }, [socket]);

  const createProducerBundle = () => {
    if (remoteVideosContainerRef.current) {
      const initCameraStreams: { [cameraId: string]: MediaStream } = {};
      for (const cameraId in userMedia.current.camera) {
        initCameraStreams[cameraId] =
          userMedia.current.camera[cameraId].getStream();
      }

      const initScreenStreams: { [screenId: string]: MediaStream } = {};
      for (const screenId in userMedia.current.screen) {
        initScreenStreams[screenId] =
          userMedia.current.screen[screenId].getStream();
      }

      const initAudioStream = userMedia.current.audio?.getStream();

      const newBundle = (
        <Bundle
          username={username.current}
          table_id={table_id.current}
          socket={socket}
          initCameraStreams={isCamera.current ? initCameraStreams : undefined}
          initScreenStreams={isScreen.current ? initScreenStreams : undefined}
          initAudioStream={isAudio.current ? initAudioStream : undefined}
          options={{
            isUser: true,
          }}
          muteButtonCallback={muteAudio}
        />
      );

      setBundles((prev) => ({
        ...prev,
        [username.current]: newBundle,
      }));
    }
  };

  const createConsumerBundle = (
    trackUsername: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => {
    const newBundle = (
      <Bundle
        username={trackUsername}
        table_id={table_id.current}
        socket={socket}
        initCameraStreams={
          Object.keys(remoteCameraStreams).length !== 0
            ? remoteCameraStreams
            : undefined
        }
        initScreenStreams={
          Object.keys(remoteScreenStreams).length !== 0
            ? remoteScreenStreams
            : undefined
        }
        initAudioStream={remoteAudioStream ? remoteAudioStream : undefined}
        onRendered={() => {
          const msg = {
            type: "requestClientMuteState",
            table_id: table_id.current,
            username: username.current,
            producerUsername: trackUsername,
          };

          socket.current.emit("message", msg);
        }}
        onNewConsumerWasCreatedCallback={() => {
          const msg = {
            type: "requestClientMuteState",
            table_id: table_id.current,
            username: username.current,
            producerUsername: trackUsername,
          };

          socket.current.emit("message", msg);
        }}
      />
    );

    setBundles((prev) => ({
      ...prev,
      [trackUsername]: newBundle,
    }));
  };

  const userDevice = new UserDevice();

  const deadbanding = new Deadbanding(currentEffectsStyles);

  const browserMedia = new BrowserMedia(
    device,
    userMedia,
    handleDisableEnableBtns,
    isCamera,
    setCameraActive,
    isScreen,
    setScreenActive,
    isAudio,
    setAudioActive
  );

  const producers = new Producers(
    socket,
    device,
    table_id,
    username,
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
    createProducerBundle,
    setBundles,
    userDevice,
    deadbanding,
    browserMedia
  );

  const consumers = new Consumers(
    table_id,
    username,
    socket,
    device,
    consumerTransport,
    remoteTracksMap,
    createConsumerBundle,
    subBtnRef
  );

  return (
    <div className='min-w-full min-h-full overflow-x-hidden flex-col'>
      <div className='flex justify-center min-w-full bg-black h-16 text-white items-center mb-10'>
        Mediasoup Video Sharing App
      </div>
      <div className='flex-col flex-wrap -mx-1 overflow-hidden px-5'>
        <div className='flex items-center justify-center'>
          <div className='flex flex-col mx-2'>
            <button
              ref={cameraBtnRef}
              onClick={() =>
                publishCamera(
                  handleDisableEnableBtns,
                  isCamera,
                  setCameraActive,
                  socket,
                  device,
                  table_id,
                  username,
                  userCameraCount,
                  userMedia
                )
              }
              className={`${
                cameraActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {cameraActive ? "Remove Camera" : "Publish Camera"}
            </button>
          </div>
          <div
            className={`${
              cameraActive ? "visible" : "hidden"
            } flex flex-col mx-2`}
          >
            <button
              ref={newCameraBtnRef}
              onClick={() =>
                publishNewCamera(
                  handleDisableEnableBtns,
                  userCameraCount,
                  socket,
                  device,
                  table_id,
                  username
                )
              }
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 disabled:opacity-25'
            >
              Publish New Camera
            </button>
          </div>
          <div className='flex flex-col mx-2'>
            <button
              ref={audioBtnRef}
              onClick={() =>
                publishAudio(
                  handleDisableEnableBtns,
                  isAudio,
                  setAudioActive,
                  socket,
                  device,
                  table_id,
                  username
                )
              }
              className={`${
                audioActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {audioActive ? "Remove Audio" : "Publish Audio"}
            </button>
          </div>
          {audioActive && (
            <div className='flex flex-col mx-2'>
              <button
                ref={muteBtnRef}
                onClick={handleMuteExternalMute}
                className={`${
                  mutedAudioRef.current
                    ? "bg-orange-500 hover:bg-orange-700"
                    : "bg-blue-500 hover:bg-blue-700"
                } text-white font-bold py-2 px-3 disabled:opacity-25`}
              >
                {mutedAudioRef.current ? "Unmute" : "Mute"}
              </button>
            </div>
          )}
          <div className='flex flex-col mx-2'>
            <button
              ref={screenBtnRef}
              onClick={() =>
                publishScreen(
                  handleDisableEnableBtns,
                  isScreen,
                  setScreenActive,
                  socket,
                  device,
                  table_id,
                  username,
                  userScreenCount,
                  userMedia
                )
              }
              className={`${
                screenActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {screenActive ? "Remove Screen" : "Publish Screen"}
            </button>
          </div>
          <div
            className={`${
              screenActive ? "visible" : "hidden"
            } flex flex-col mx-2`}
          >
            <button
              ref={newScreenBtnRef}
              onClick={() =>
                publishNewScreen(
                  handleDisableEnableBtns,
                  userScreenCount,
                  socket,
                  device,
                  table_id,
                  username
                )
              }
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 disabled:opacity-25'
            >
              Publish New Screen
            </button>
          </div>
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
          <AudioEffectsButton handleMuteExternalMute={handleMuteExternalMute} />
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
                username: username.current,
                table_id: table_id.current,
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
            Object.entries(bundles).map(([key, bundle]) => (
              <div key={key} id={`${key}_bundle`}>
                {bundle}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
