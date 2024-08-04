import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import {
  volumeHigh1a,
  volumeHigh1b,
  volumeHigh2a,
  volumeHigh2b,
  volumeHigh3a,
  volumeHigh3b,
  volumeHighOffIB1a,
  volumeHighOffIB1b,
  volumeHighOffIB2a,
  volumeHighOffIB2b,
  volumeHighOffIB3a,
  volumeHighOffIB3b,
  volumeOff1a,
  volumeOff1b,
  volumeOff2a,
  volumeOff2b,
  volumeOff3a,
  volumeOff3b,
} from "../fgVideo/lib/svgPaths";
import FgVideo from "../fgVideo/FgVideo";
import FgAudioElement from "../fgAudioElement/FgAudioElement";
import { useStreamsContext } from "../context/StreamsContext";
import BundleController from "./lib/BundleController";

export default function Bundle({
  username,
  table_id,
  socket,
  initCameraStreams,
  initScreenStreams,
  initAudioStream,
  isUser = false,
  primaryVolumeSliderColor = "white",
  secondaryVolumeSliderColor = "rgba(150, 150, 150, 0.5)",
  muteButtonCallback,
  initialVolume = "high",
  onRendered,
}: {
  username: string;
  table_id: string;
  socket: React.MutableRefObject<Socket>;
  initCameraStreams?: { [cameraKey: string]: MediaStream };
  initScreenStreams?: { [screenKey: string]: MediaStream };
  initAudioStream?: MediaStream;
  isUser?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  tertiaryVolumeSliderColor?: string;
  quaternaryVolumeSliderColor?: string;
  muteButtonCallback?: () => any;
  initialVolume?: string;
  onRendered?: () => any;
}) {
  const { userMedia, remoteTracksMap } = useStreamsContext();
  const [cameraStreams, setCameraStreams] = useState<
    | {
        [screenKey: string]: MediaStream;
      }
    | undefined
  >(initCameraStreams);
  const [screenStreams, setScreenStreams] = useState<
    | {
        [screenKey: string]: MediaStream;
      }
    | undefined
  >(initScreenStreams);
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>(
    initAudioStream
  );
  const [paths, setPaths] = useState<string[][]>([
    [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
    [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
    [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
    [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
    [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
    [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
  ]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bundleRef = useRef<HTMLDivElement>(null);
  const videoIconStateRef = useRef({ from: "", to: initialVolume });
  const isFinishedRef = useRef(true);
  const changedWhileNotFinishedRef = useRef(false);

  const clientMute = useRef(false); // User audio mute
  const localMute = useRef(false); // Not user audio mute

  const bundleController = new BundleController(
    isUser,
    username,
    clientMute,
    videoIconStateRef,
    setPaths,
    isFinishedRef,
    changedWhileNotFinishedRef,
    audioRef,
    localMute,
    setCameraStreams,
    setScreenStreams,
    setAudioStream,
    remoteTracksMap,
    userMedia,
    bundleRef,
    primaryVolumeSliderColor,
    secondaryVolumeSliderColor,
    muteButtonCallback
  );

  // Initial functions & call onRendered call back if one is availiable
  useEffect(() => {
    // Set initial volume slider
    bundleController.tracksColorSetter();

    if (onRendered) {
      onRendered();
    }

    socket.current.on("message", (event) =>
      bundleController.handleMessage(event)
    );

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event) =>
        bundleController.handleMessage(event)
      );
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioStream && !isUser) {
      audioRef.current.srcObject = audioStream;
    }

    audioRef.current?.addEventListener(
      "volumechange",
      bundleController.volumeChangeHandler
    );

    return () => {
      audioRef.current?.removeEventListener(
        "volumechange",
        bundleController.volumeChangeHandler
      );
    };
  }, [audioRef, audioStream]);

  return (
    <div
      ref={bundleRef}
      id={`${username}_bundle_container`}
      className='bundle-container'
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <FgVideo
            key={key}
            type='camera'
            username={username}
            table_id={table_id}
            socket={socket}
            videoId={key}
            fgVideoOptions={{
              isUser: isUser,
              isStream: true,
              flipVideo: true,
              isSlider: !isUser,
              isVolume: audioStream ? true : false,
              isTotalTime: false,
              isPlaybackSpeed: false,
              isClosedCaptions: false,
              isTimeLine: false,
              isSkip: false,
              isThumbnail: false,
              isPreview: false,
            }}
            handleMute={bundleController.handleMute}
            videoStream={cameraStream}
            audioRef={audioRef}
            handleVolumeSlider={bundleController.handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            tracksColorSetter={bundleController.tracksColorSetter}
          />
        ))}
      {screenStreams &&
        Object.keys(screenStreams).length !== 0 &&
        Object.entries(screenStreams).map(([key, screenStream]) => (
          <FgVideo
            key={key}
            type='screen'
            username={username}
            table_id={table_id}
            socket={socket}
            videoId={key}
            fgVideoOptions={{
              isUser: isUser,
              isStream: true,
              isSlider: !isUser,
              isVolume: audioStream ? true : false,
              isTotalTime: false,
              isPlaybackSpeed: false,
              isClosedCaptions: false,
              isTimeLine: false,
              isSkip: false,
              isThumbnail: false,
              isPreview: false,
            }}
            handleMute={bundleController.handleMute}
            videoStream={screenStream}
            audioRef={audioRef}
            handleVolumeSlider={bundleController.handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            tracksColorSetter={bundleController.tracksColorSetter}
          />
        ))}
      {audioStream &&
        Object.keys(cameraStreams || {}).length === 0 &&
        Object.keys(screenStreams || {}).length === 0 && (
          <div id={`${username}_audio_container`} className='relative'>
            <FgAudioElement
              audioStream={audioStream}
              audioRef={audioRef}
              username={username}
              handleMute={bundleController.handleMute}
              localMute={localMute}
              isUser={isUser}
              clientMute={clientMute}
            />
          </div>
        )}
      {audioStream && (
        <audio
          ref={audioRef}
          id={`${username}_audio_stream`}
          className='w-0 z-0'
          autoPlay={true}
        ></audio>
      )}
    </div>
  );
}
