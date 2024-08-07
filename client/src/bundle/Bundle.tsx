import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import FgVideo from "../fgVideo/FgVideo";
import FgAudioElement from "../fgAudioElement/FgAudioElement";
import { useStreamsContext } from "../context/StreamsContext";
import BundleController from "./lib/BundleController";

interface BundleOptions {
  isUser?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  initialVolume?: "off" | "low" | "high";
}

const defaultBundleOptions = {
  isUser: false,
  primaryVolumeSliderColor: "white",
  secondaryVolumeSliderColor: "rgba(150, 150, 150, 0.5)",
};

export default function Bundle({
  username,
  table_id,
  socket,
  initCameraStreams,
  initScreenStreams,
  initAudioStream,
  options,
  muteButtonCallback,
  initialVolume,
  onRendered,
  onNewConsumerWasCreatedCallback,
}: {
  username: string;
  table_id: string;
  socket: React.MutableRefObject<Socket>;
  initCameraStreams?: { [cameraKey: string]: MediaStream };
  initScreenStreams?: { [screenKey: string]: MediaStream };
  initAudioStream?: MediaStream;
  options?: BundleOptions;
  muteButtonCallback?: () => any;
  initialVolume?: "off" | "low" | "high";
  onRendered?: () => any;
  onNewConsumerWasCreatedCallback?: () => any;
}) {
  const bundleOptions = {
    ...defaultBundleOptions,
    ...options,
  };

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const bundleRef = useRef<HTMLDivElement>(null);

  const clientMute = useRef(false); // User audio mute
  const localMute = useRef(false); // Not user audio mute

  const bundleController = new BundleController(
    bundleOptions.isUser,
    username,
    setCameraStreams,
    setScreenStreams,
    setAudioStream,
    remoteTracksMap,
    userMedia,
    clientMute,
    localMute,
    onNewConsumerWasCreatedCallback
  );

  // Initial functions & call onRendered call back if one is availiable
  useEffect(() => {
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
    if (audioRef.current && audioStream && !bundleOptions.isUser) {
      audioRef.current.srcObject = audioStream;
    }
  }, [audioRef, audioStream]);

  const handleMute = () => {
    if (muteButtonCallback !== undefined) {
      muteButtonCallback();
    }

    if (clientMute.current) {
      return;
    }

    localMute.current = !localMute.current;

    if (audioRef.current && bundleOptions.isUser) {
      audioRef.current.muted = true;
    }
  };

  const volumeChangeHandler = () => {
    if (!bundleRef.current) {
      return;
    }

    const volumeSliders = bundleRef.current.querySelectorAll(".volume-slider");

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (audioRef.current) {
        sliderElement.value = audioRef.current.muted
          ? "0"
          : audioRef.current.volume.toString();
      }
    });
    tracksColorSetter();
  };

  const tracksColorSetter = () => {
    if (!bundleRef.current || !audioRef.current) {
      return;
    }

    const volumeSliders = bundleRef.current.querySelectorAll(".volume-slider");

    let value = audioRef.current.volume;
    if (audioRef.current.muted) {
      value = 0;
    }
    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${bundleOptions.primaryVolumeSliderColor} 0%, ${bundleOptions.primaryVolumeSliderColor} ${percentage}%, ${bundleOptions.secondaryVolumeSliderColor} ${percentage}%, ${bundleOptions.secondaryVolumeSliderColor} 100%)`;

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      sliderElement.style.background = trackColor;
    });
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (bundleRef.current) {
      const volumeSliders =
        bundleRef.current.querySelectorAll(".volume-slider");

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = `${volume}`;
      });
    }

    tracksColorSetter();
  };

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
            options={{
              isUser: bundleOptions.isUser,
              isStream: true,
              flipVideo: true,
              isSlider: !bundleOptions.isUser,
              isVolume: audioStream ? true : false,
              isTotalTime: false,
              isPlaybackSpeed: false,
              isClosedCaptions: false,
              isTimeLine: false,
              isSkip: false,
              isThumbnail: false,
              isPreview: false,
              initialVolume: initialVolume
                ? initialVolume
                : audioRef.current
                ? audioRef.current.muted
                  ? "off"
                  : audioRef.current.volume > 0.5
                  ? "high"
                  : "low"
                : "high",
            }}
            handleMute={handleMute}
            videoStream={cameraStream}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            tracksColorSetter={tracksColorSetter}
            volumeChangeHandler={volumeChangeHandler}
            clientMute={clientMute}
            isUser={bundleOptions.isUser}
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
            options={{
              isUser: bundleOptions.isUser,
              isStream: true,
              isSlider: !bundleOptions.isUser,
              isVolume: audioStream ? true : false,
              isTotalTime: false,
              isPlaybackSpeed: false,
              isClosedCaptions: false,
              isTimeLine: false,
              isSkip: false,
              isThumbnail: false,
              isPreview: false,
              initialVolume: initialVolume
                ? initialVolume
                : audioRef.current
                ? audioRef.current.muted
                  ? "off"
                  : audioRef.current.volume > 0.5
                  ? "high"
                  : "low"
                : "high",
            }}
            handleMute={handleMute}
            videoStream={screenStream}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            tracksColorSetter={tracksColorSetter}
            volumeChangeHandler={volumeChangeHandler}
            clientMute={clientMute}
            isUser={bundleOptions.isUser}
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
              handleMute={handleMute}
              localMute={localMute}
              isUser={bundleOptions.isUser}
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
