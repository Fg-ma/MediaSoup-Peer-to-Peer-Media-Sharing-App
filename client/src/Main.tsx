import React, { useEffect, useRef, useState } from "react";
import { Root, createRoot } from "react-dom/client";
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
import onMuteLockChange from "./lib/onMuteLockChange";
import onAcceptedMuteLock from "./lib/onAcceptedMuteLock";
import publishNewCamera from "./publishNewCamera";
import publishNewScreen from "./publishNewScreen";

const websocketURL = "http://localhost:8000";

export default function Main() {
  const webcamBtnRef = useRef<HTMLButtonElement>(null);
  const newCameraBtnRef = useRef<HTMLButtonElement>(null);
  const newScreenBtnRef = useRef<HTMLButtonElement>(null);
  const screenBtnRef = useRef<HTMLButtonElement>(null);
  const audioBtnRef = useRef<HTMLButtonElement>(null);
  const muteBtnRef = useRef<HTMLButtonElement>(null);
  const subBtnRef = useRef<HTMLButtonElement>(null);
  const roomNameRef = useRef<HTMLInputElement>(null);
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

  const cameraStreams = useRef<{ [webcamId: string]: MediaStream }>({});
  const cameraCount = useRef(0);
  const screenStreams = useRef<{ [screenId: string]: MediaStream }>({});
  let screenCount = useRef(0);
  const audioStream = useRef<MediaStream>();

  const remoteTracksMap = useRef<{
    [username: string]: {
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    };
  }>({});
  const roomName = useRef("");
  const username = useRef("");

  let socket = useRef<Socket>(io(websocketURL));
  let device = useRef<mediasoup.Device>();

  useEffect(() => {
    socket.current.on("connect", () => {
      const msg = {
        type: "getRouterRtpCapabilities",
        roomName: roomName.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    });

    socket.current.on("message", (event) => {
      switch (event.type) {
        case "routerCapabilities":
          onRouterCapabilities(event, device);
          break;
        case "producerTransportCreated":
          onProducerTransportCreated(
            event,
            socket,
            device,
            roomName,
            username,
            isWebcam,
            isScreen,
            isAudio,
            cameraStreams,
            cameraCount,
            screenStreams,
            screenCount,
            audioStream,
            handleDisableEnableBtns,
            remoteVideosContainerRef,
            producerTransport,
            muteAudio,
            setScreenActive,
            setWebcamActive
          );
          break;
        case "consumerTransportCreated":
          onConsumerTransportCreated(
            event,
            socket,
            device,
            roomName,
            username,
            consumerTransport,
            remoteVideosContainerRef,
            remoteTracksMap
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
            roomName,
            username,
            consumerTransport,
            remoteVideosContainerRef,
            remoteTracksMap
          );
          break;
        case "newProducerAvailable":
          onNewProducerAvailable(
            event,
            socket,
            device,
            roomName,
            username,
            isSubscribed
          );
          break;
        case "newProducer":
          onNewProducer(
            event,
            device,
            username,
            isWebcam,
            isScreen,
            isAudio,
            cameraStreams,
            cameraCount,
            screenStreams,
            screenCount,
            audioStream,
            handleDisableEnableBtns,
            remoteVideosContainerRef,
            producerTransport,
            muteAudio,
            setScreenActive,
            setWebcamActive
          );
          break;
        case "producerDisconnected":
          onProducerDisconnected(
            event,
            username,
            handleDisableEnableBtns,
            remoteVideosContainerRef,
            cameraStreams,
            screenStreams,
            audioStream,
            remoteTracksMap,
            producerTransport,
            muteAudio,
            isWebcam,
            setWebcamActive,
            isScreen,
            setScreenActive
          );
          break;
        case "muteLockChange":
          onMuteLockChange(event, username);
          break;
        case "requestedMuteLock":
          onRequestedMuteLock(event, socket, username, roomName, mutedAudioRef);
          break;
        case "acceptedMuteLock":
          onAcceptedMuteLock(event);
          break;
        default:
          break;
      }
    });

    // User disconnect
    socket.current.on("userDisconnected", (disconnectedUsername) => {
      const oldBundle = document.getElementById(
        `${disconnectedUsername}_bundle`
      );
      if (oldBundle && remoteVideosContainerRef.current?.contains(oldBundle)) {
        remoteVideosContainerRef.current?.removeChild(oldBundle);
      }
      delete remoteTracksMap.current[disconnectedUsername];
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("message");
      socket.current.off("userDisconnected");
    };
  }, [socket]);

  const muteAudio = () => {
    if (audioStream.current) {
      audioStream.current.getAudioTracks().forEach((track) => {
        track.enabled = mutedAudioRef.current;
      });
    }

    setMutedAudio((prev) => !prev);
    mutedAudioRef.current = !mutedAudioRef.current;

    const msg = {
      type: "muteLock",
      isMuteLock: mutedAudioRef.current,
      roomName: roomName.current,
      username: username.current,
    };

    socket.current.emit("message", msg);

    const bundleContainerElement = document.getElementById(
      `${username.current}_bundle_container`
    );
    if (bundleContainerElement) {
      if (mutedAudioRef.current) {
        bundleContainerElement.classList.add("mute");
      } else {
        bundleContainerElement.classList.remove("mute");
      }
    }
  };

  const handleDisableEnableBtns = (disabled: boolean) => {
    if (webcamBtnRef.current) webcamBtnRef.current!.disabled = disabled;
    if (screenBtnRef.current) screenBtnRef.current!.disabled = disabled;
    if (audioBtnRef.current) audioBtnRef.current!.disabled = disabled;
    if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = disabled;
    if (newScreenBtnRef.current) newScreenBtnRef.current.disabled = disabled;
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
                  roomName,
                  username,
                  cameraCount,
                  cameraStreams
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
                  cameraCount,
                  socket,
                  device,
                  roomName,
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
                  roomName,
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
                onClick={muteAudio}
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
                  roomName,
                  username,
                  screenCount,
                  screenStreams
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
                  screenCount,
                  socket,
                  device,
                  roomName,
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
                  roomName,
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
            ref={roomNameRef}
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
                roomNameRef,
                usernameRef,
                roomName,
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
        <div
          ref={remoteVideosContainerRef}
          className='w-full grid grid-cols-4'
        ></div>
      </div>
    </div>
  );
}
