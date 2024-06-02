import React, { useEffect, useRef, useState } from "react";
import * as mediasoup from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import publishCamera from "./publishCamera";
import publishScreen from "./publishScreen";
import onRouterCapabilities from "./lib/onRouterCapabilities";
import onProducerTransportCreated from "./lib/onProducerTransportCreated";
import onConsumerTransportCreated from "./lib/onConsumerTransportCreated";
import onSubscribed from "./lib/onSubscribed";
import subscribe from "./subscribe";
import joinRoom from "./joinRoom";
import onNewConsumerSubscribed from "./lib/onNewConsumerSubscribed";
import onNewProducerAvailable from "./lib/onNewProducerAvailable";
import onNewProducer from "./lib/onNewProducer";
import onProducerDisconnected from "./lib/onProducerDisconnected";
import publishAudio from "./publishAudio";
import onRequestedMuteLock from "./lib/onRequestedMuteLock";
import publishNewCamera from "./publishNewCamera";
import publishNewScreen from "./publishNewScreen";
import { useStreamsContext } from "./context/StreamsContext";
import Bundle from "./bundle/Bundle";

const websocketURL = "http://localhost:8000";

export default function Main() {
  const {
    userCameraStreams,
    userCameraCount,
    userScreenStreams,
    userScreenCount,
    userAudioStream,
    remoteTracksMap,
  } = useStreamsContext();
  const webcamBtnRef = useRef<HTMLButtonElement>(null);
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
  const isWebcam = useRef(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const isScreen = useRef(false);
  const [screenActive, setScreenActive] = useState(false);
  const isAudio = useRef(false);
  const [audioActive, setAudioActive] = useState(false);
  const [mutedAudio, setMutedAudio] = useState(false);
  const mutedAudioRef = useRef(false);
  const [subscribedActive, setSubscribedActive] = useState(false);
  const isSubscribed = useRef(false);
  const [isInRoom, setIsInRoom] = useState(false);

  const table_id = useRef("");
  const username = useRef("");

  let socket = useRef<Socket>(io(websocketURL));
  let device = useRef<mediasoup.Device>();

  const [bundles, setBundles] = useState<{
    [username: string]: React.JSX.Element;
  }>();

  const muteAudio = () => {
    if (userAudioStream.current) {
      userAudioStream.current.getAudioTracks().forEach((track) => {
        track.enabled = mutedAudioRef.current;
      });
    }

    setMutedAudio((prev) => !prev);
    mutedAudioRef.current = !mutedAudioRef.current;

    const msg = {
      type: "muteLock",
      isMuteLock: mutedAudioRef.current,
      table_id: table_id.current,
      username: username.current,
    };

    socket.current.emit("message", msg);
  };

  const handleMuteAudioBtn = () => {
    muteAudio();

    const msg = {
      type: "sendMuteRequest",
      table_id: table_id.current,
      username: username.current,
    };

    socket.current.emit("message", msg);
  };

  const handleDisableEnableBtns = (disabled: boolean) => {
    if (webcamBtnRef.current) webcamBtnRef.current!.disabled = disabled;
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
        onProducerTransportCreated(
          event,
          socket,
          device,
          table_id,
          username,
          userCameraStreams,
          userCameraCount,
          userScreenStreams,
          userScreenCount,
          userAudioStream,
          isWebcam,
          isScreen,
          isAudio,
          handleDisableEnableBtns,
          producerTransport,
          setScreenActive,
          setWebcamActive,
          createProducerBundle
        );
        break;
      case "consumerTransportCreated":
        onConsumerTransportCreated(
          event,
          socket,
          device,
          table_id,
          username,
          consumerTransport,
          remoteTracksMap,
          createConsumerBundle
        );
        break;
      case "resumed":
        break;
      case "subscribed":
        onSubscribed(event, consumerTransport, remoteTracksMap, subBtnRef);
        break;
      case "newConsumerSubscribed":
        onNewConsumerSubscribed(
          event,
          socket,
          table_id,
          username,
          consumerTransport,
          remoteTracksMap,
          createConsumerBundle
        );
        break;
      case "newProducerAvailable":
        onNewProducerAvailable(
          event,
          socket,
          device,
          table_id,
          username,
          isSubscribed
        );
        break;
      case "newProducer":
        onNewProducer(
          event,
          device,
          username,
          table_id,
          socket,
          userCameraStreams,
          userCameraCount,
          userScreenStreams,
          userScreenCount,
          userAudioStream,
          isWebcam,
          isScreen,
          handleDisableEnableBtns,
          producerTransport,
          setScreenActive,
          setWebcamActive
        );
        break;
      case "producerDisconnected":
        onProducerDisconnected(
          event,
          username,
          userCameraStreams,
          userScreenStreams,
          userAudioStream,
          handleDisableEnableBtns,
          remoteTracksMap,
          producerTransport,
          isWebcam,
          setWebcamActive,
          isScreen,
          setScreenActive,
          setBundles
        );
        break;
      case "requestedMuteLock":
        onRequestedMuteLock(event, socket, username, table_id, mutedAudioRef);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    socket.current.on("connect", () => {
      const msg = {
        type: "getRouterRtpCapabilities",
        table_id: table_id.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    });

    socket.current.on("message", handleMessage);

    // User disconnect
    socket.current.on("userDisconnected", (disconnectedUsername) => {
      const oldBundle = document.getElementById(
        `${disconnectedUsername}_bundle`
      );
      if (oldBundle && remoteVideosContainerRef.current?.contains(oldBundle)) {
        try {
          remoteVideosContainerRef.current?.removeChild(oldBundle);
        } catch {
          console.error("Failed to remove disconnected bundle");
          return;
        }
      }
      delete remoteTracksMap.current[disconnectedUsername];
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("message", handleMessage);
      socket.current.off("userDisconnected");
    };
  }, [socket]);

  const createProducerBundle = () => {
    if (remoteVideosContainerRef.current) {
      setBundles((prev) => ({
        ...prev,
        [username.current]: (
          <Bundle
            username={username.current}
            table_id={table_id.current}
            socket={socket}
            initCameraStreams={
              isWebcam.current && userCameraStreams.current
                ? userCameraStreams.current
                : undefined
            }
            initScreenStreams={
              isScreen.current && userScreenStreams.current
                ? userScreenStreams.current
                : undefined
            }
            initAudioStream={
              isAudio.current && userAudioStream.current
                ? userAudioStream.current
                : undefined
            }
            isUser={true}
            muteButtonCallback={muteAudio}
          />
        ),
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
    setBundles((prev) => ({
      ...prev,
      [trackUsername]: (
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
              type: "requestMuteLock",
              table_id: table_id.current,
              username: username.current,
              producerUsername: trackUsername,
            };

            socket.current.emit("message", msg);
          }}
        />
      ),
    }));
  };

  return (
    <div className='min-w-full min-h-full overflow-x-hidden flex-col'>
      <div className='flex justify-center min-w-full bg-black h-16 text-white items-center mb-10'>
        Mediasoup Video Sharing App
      </div>
      <div className='flex-col flex-wrap -mx-1 overflow-hidden px-5'>
        <div className='flex items-center justify-center'>
          <div className='flex flex-col mx-2'>
            <button
              ref={webcamBtnRef}
              onClick={() =>
                publishCamera(
                  handleDisableEnableBtns,
                  isWebcam,
                  setWebcamActive,
                  socket,
                  device,
                  table_id,
                  username,
                  userCameraCount,
                  userCameraStreams
                )
              }
              className={`${
                webcamActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {webcamActive ? "Remove Camera" : "Publish Camera"}
            </button>
          </div>
          <div
            className={`${
              webcamActive ? "visible" : "hidden"
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
                onClick={handleMuteAudioBtn}
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
                  userScreenStreams
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
                  remoteVideosContainerRef
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
        </div>
        <div className='flex justify-center mt-5'>
          <input
            type='text'
            ref={tableIdRef}
            className='border border-gray-400 px-4 py-2 mr-2'
            placeholder='Enter room name'
          />
          <input
            type='text'
            ref={usernameRef}
            className='border border-gray-400 px-4 py-2 mr-2'
            placeholder='Enter username'
          />
          <button
            onClick={() =>
              joinRoom(
                socket,
                tableIdRef,
                usernameRef,
                table_id,
                username,
                setIsInRoom
              )
            }
            className={`${
              isInRoom
                ? "bg-orange-500 hover:bg-orange-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold py-2 px-4`}
          >
            {isInRoom ? "Join New Room" : "Join Room"}
          </button>
        </div>
        <div ref={remoteVideosContainerRef} className='w-full grid grid-cols-3'>
          {bundles &&
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
