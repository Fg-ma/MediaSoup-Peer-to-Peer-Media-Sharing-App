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
import FgVideo from "./FgVideo";

const websocketURL = "http://localhost:8000";

export default function Main() {
  const webcamBtnRef = useRef<HTMLButtonElement>(null);
  const screenBtnRef = useRef<HTMLButtonElement>(null);
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
  const [subscribedActive, setSubscribedActive] = useState(false);
  const isSubscribed = useRef(false);
  const [isInRoom, setIsInRoom] = useState(false);

  const cameraStream = useRef<MediaStream>();
  const screenStream = useRef<MediaStream>();

  const remoteTracksMap = useRef<{
    [username: string]: {
      webcam?: MediaStreamTrack;
      screen?: MediaStreamTrack;
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
            cameraStream,
            screenStream,
            webcamBtnRef,
            screenBtnRef,
            remoteVideosContainerRef,
            producerTransport
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
            cameraStream,
            screenStream,
            webcamBtnRef,
            screenBtnRef,
            remoteVideosContainerRef,
            producerTransport
          );
          break;
        default:
          break;
      }
    });

    socket.current.on("userDisconnected", (disconnectedUsername) => {
      const oldVideo = document.getElementById(
        `live_video_track_${disconnectedUsername}`
      );
      const oldScreen = document.getElementById(
        `screen_track_${disconnectedUsername}`
      );
      if (oldVideo) {
        remoteVideosContainerRef.current?.removeChild(oldVideo);
      }
      if (oldScreen) {
        remoteVideosContainerRef.current?.removeChild(oldScreen);
      }
      delete remoteTracksMap.current[disconnectedUsername];
    });

    socket.current.on(
      "producerDisconnected",
      (disconnectedProducerUsername, producerType) => {
        if (producerType === "webcam") {
          if (disconnectedProducerUsername === username.current) {
            webcamBtnRef.current!.disabled = false;
            const tracks = cameraStream.current?.getTracks();

            tracks?.forEach((track) => {
              track.stop();
            });
            cameraStream.current = undefined;
          }
          const oldVideo = document.getElementById(
            `live_video_track_${disconnectedProducerUsername}`
          ) as HTMLVideoElement;
          if (oldVideo) {
            remoteVideosContainerRef.current?.removeChild(oldVideo);
          }
          if (
            remoteTracksMap.current[disconnectedProducerUsername] &&
            Object.keys(
              remoteTracksMap.current[disconnectedProducerUsername] || {}
            ).length == 1
          ) {
            remoteTracksMap.current[
              disconnectedProducerUsername
            ].webcam?.stop();
            delete remoteTracksMap.current[disconnectedProducerUsername];
          } else if (remoteTracksMap.current[disconnectedProducerUsername]) {
            remoteTracksMap.current[
              disconnectedProducerUsername
            ].webcam?.stop();
            delete remoteTracksMap.current[disconnectedProducerUsername].webcam;
          }
        }
        if (producerType === "screen") {
          if (disconnectedProducerUsername === username.current) {
            screenBtnRef.current!.disabled = false;
            const tracks = screenStream.current?.getTracks();

            tracks?.forEach((track) => {
              track.stop();
            });
            screenStream.current = undefined;
          }
          const oldScreen = document.getElementById(
            `screen_track_${disconnectedProducerUsername}`
          ) as HTMLVideoElement;
          if (oldScreen) {
            remoteVideosContainerRef.current?.removeChild(oldScreen);
          }
          if (
            remoteTracksMap.current[disconnectedProducerUsername] &&
            Object.keys(
              remoteTracksMap.current[disconnectedProducerUsername] || {}
            ).length == 1
          ) {
            remoteTracksMap.current[
              disconnectedProducerUsername
            ].screen?.stop();
            delete remoteTracksMap.current[disconnectedProducerUsername];
          } else if (remoteTracksMap.current[disconnectedProducerUsername]) {
            remoteTracksMap.current[
              disconnectedProducerUsername
            ].screen?.stop();
            delete remoteTracksMap.current[disconnectedProducerUsername].screen;
          }
        }
        if (!screenStream.current && !cameraStream.current) {
          producerTransport.current = undefined;
        }
      }
    );
  }, [socket]);

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
              ref={screenBtnRef}
              onClick={() =>
                publishScreen(
                  isScreen,
                  screenBtnRef,
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
      <FgVideo />
    </div>
  );
}
