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

const websocketURL = "http://localhost:8000";

export default function Main() {
  const webcamBtnRef = useRef<HTMLButtonElement>(null);
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

  const cameraStream = useRef<MediaStream>();
  const screenStream = useRef<MediaStream>();
  const audioStream = useRef<MediaStream>();

  const remoteTracksMap = useRef<{
    [username: string]: {
      webcam?: MediaStreamTrack;
      screen?: MediaStreamTrack;
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
            cameraStream,
            screenStream,
            audioStream,
            webcamBtnRef,
            screenBtnRef,
            audioBtnRef,
            remoteVideosContainerRef,
            producerTransport,
            muteAudio
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
            cameraStream,
            screenStream,
            audioStream,
            webcamBtnRef,
            screenBtnRef,
            audioBtnRef,
            remoteVideosContainerRef,
            producerTransport,
            muteAudio
          );
          break;
        case "producerDisconnected":
          onProducerDisconnected(
            event,
            username,
            webcamBtnRef,
            screenBtnRef,
            audioBtnRef,
            remoteVideosContainerRef,
            cameraStream,
            screenStream,
            audioStream,
            remoteTracksMap,
            producerTransport,
            muteAudio
          );
          break;
        case "muteLockChange":
          onMuteLockChange(event);
          break;
        case "requestedMuteLock":
          onRequestedMuteLock(event);
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
      const oldVideo = document.getElementById(
        `live_video_track_${disconnectedUsername}`
      );
      const oldScreen = document.getElementById(
        `screen_track_${disconnectedUsername}`
      );
      const oldAudio = document.getElementById(
        `audio_track_${disconnectedUsername}`
      );
      const oldVideoAudio = document.getElementById(
        `live_video_audio_track_${disconnectedUsername}`
      );
      if (oldVideo) {
        remoteVideosContainerRef.current?.removeChild(oldVideo);
      }
      if (oldScreen) {
        remoteVideosContainerRef.current?.removeChild(oldScreen);
      }
      if (oldAudio) {
        remoteVideosContainerRef.current?.removeChild(oldAudio);
      }
      if (oldVideoAudio) {
        remoteVideosContainerRef.current?.removeChild(oldVideoAudio);
      }
      delete remoteTracksMap.current[disconnectedUsername];
    });

    return () => {
      socket.current.off("connect");
      socket.current.off("message");
      socket.current.off("userDisconnected");
    };
  }, [socket, mutedAudio]);

  const onAcceptedMuteLock = (event: {
    type: string;
    producerUsername: string;
  }) => {
    const audioElement = document.getElementById(
      `audio_track_${event.producerUsername}`
    );
    if (audioElement) {
      const videoContainer =
        audioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        videoContainer[0].classList.add("mute-lock");
      }
    }

    const screenAudioElement = document.getElementById(
      `screen_audio_track_${event.producerUsername}`
    );
    if (screenAudioElement) {
      const videoContainer =
        screenAudioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        videoContainer[0].classList.add("mute-lock");
      }
    }

    const liveVideoAudioElement = document.getElementById(
      `live_video_audio_track_${event.producerUsername}`
    );
    if (liveVideoAudioElement) {
      const videoContainer =
        liveVideoAudioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        videoContainer[0].classList.add("mute-lock");
      }
    }
  };

  const onRequestedMuteLock = (event: { type: string; username: string }) => {
    if (mutedAudioRef.current) {
      const msg = {
        type: "acceptMuteLock",
        roomName: roomName.current,
        username: event.username,
        producerUsername: username.current,
      };

      socket.current.emit("message", msg);
    }
  };

  const onMuteLockChange = (event: {
    type: string;
    isMuteLock: boolean;
    username: string;
  }) => {
    if (event.username === username.current) {
      return;
    }

    const audioElement = document.getElementById(
      `audio_track_${event.username}`
    );
    if (audioElement) {
      const videoContainer =
        audioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        if (event.isMuteLock) {
          videoContainer[0].classList.add("mute-lock");
        } else {
          videoContainer[0].classList.remove("mute-lock");
        }
      }
    }

    const screenAudioElement = document.getElementById(
      `screen_audio_track_${event.username}`
    );
    if (screenAudioElement) {
      const videoContainer =
        screenAudioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        if (event.isMuteLock) {
          videoContainer[0].classList.add("mute-lock");
        } else {
          videoContainer[0].classList.remove("mute-lock");
        }
      }
    }

    const liveVideoAudioElement = document.getElementById(
      `live_video_audio_track_${event.username}`
    );
    if (liveVideoAudioElement) {
      const videoContainer =
        liveVideoAudioElement.getElementsByClassName("video-container");
      if (videoContainer[0]) {
        if (event.isMuteLock) {
          videoContainer[0].classList.add("mute-lock");
        } else {
          videoContainer[0].classList.remove("mute-lock");
        }
      }
    }
  };

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

    const audioElement = document.getElementById(
      `audio_track_${username.current}`
    );
    if (audioElement) {
      const videoContainer =
        audioElement.getElementsByClassName("video-container");
      if (videoContainer) {
        if (mutedAudioRef.current) {
          videoContainer[0].classList.add("mute");
        } else {
          videoContainer[0].classList.remove("mute");
        }
      }
    }

    const screenAudioElement = document.getElementById(
      `screen_audio_track_${username.current}`
    );
    if (screenAudioElement) {
      const videoContainer =
        screenAudioElement.getElementsByClassName("video-container");
      if (videoContainer) {
        if (mutedAudioRef.current) {
          videoContainer[0].classList.add("mute");
        } else {
          videoContainer[0].classList.remove("mute");
        }
      }
    }

    const liveVideoAudioElement = document.getElementById(
      `live_video_audio_track_${username.current}`
    );
    if (liveVideoAudioElement) {
      const videoContainer =
        liveVideoAudioElement.getElementsByClassName("video-container");
      if (videoContainer) {
        if (mutedAudioRef.current) {
          videoContainer[0].classList.add("mute");
        } else {
          videoContainer[0].classList.remove("mute");
        }
      }
    }
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
                  isWebcam,
                  webcamBtnRef,
                  screenBtnRef,
                  audioBtnRef,
                  setWebcamActive,
                  socket,
                  device,
                  roomName,
                  username
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
          <div className='flex flex-col mx-2'>
            <button
              ref={audioBtnRef}
              onClick={() =>
                publishAudio(
                  isAudio,
                  audioBtnRef,
                  webcamBtnRef,
                  screenBtnRef,
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
          </div>{" "}
          {audioActive && (
            <div className='flex flex-col mx-2'>
              <button
                ref={muteBtnRef}
                onClick={muteAudio}
                className={`${
                  mutedAudio
                    ? "bg-orange-500 hover:bg-orange-700"
                    : "bg-blue-500 hover:bg-blue-700"
                } text-white font-bold py-2 px-3 disabled:opacity-25`}
              >
                {mutedAudio ? "Unmute" : "Mute"}
              </button>
            </div>
          )}
          <div className='flex flex-col mx-2'>
            <button
              ref={screenBtnRef}
              onClick={() =>
                publishScreen(
                  isScreen,
                  webcamBtnRef,
                  screenBtnRef,
                  audioBtnRef,
                  setScreenActive,
                  socket,
                  device,
                  roomName,
                  username
                )
              }
              className={`${
                screenActive
                  ? "bg-orange-500 hover:bg-orange-700"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white font-bold py-2 px-3 disabled:opacity-25`}
            >
              {screenActive ? "Remove Desktop" : "Publish Desktop"}
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
