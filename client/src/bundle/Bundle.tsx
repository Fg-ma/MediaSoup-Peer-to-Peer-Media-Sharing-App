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
    tracksColorSetter();

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

    audioRef.current?.addEventListener("volumechange", volumeChangeHandler);

    return () => {
      audioRef.current?.removeEventListener(
        "volumechange",
        volumeChangeHandler
      );
    };
  }, [audioRef, audioStream]);

  const handleMute = () => {
    if (muteButtonCallback !== undefined) {
      muteButtonCallback();
    }

    if (clientMute.current) {
      return;
    }

    localMute.current = !localMute.current;

    if (audioRef.current && !isUser) {
      audioRef.current.muted = localMute.current;
    }

    if (localMute.current) {
      if (!isFinishedRef.current) {
        if (!changedWhileNotFinishedRef.current) {
          changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: "off",
      };

      const newPaths = bundleController.getPaths(
        videoIconStateRef.current.from,
        "off"
      );
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    } else {
      if (!audioRef.current) {
        return;
      }

      const newVolume = audioRef.current.volume;
      let newVolumeState;
      if (newVolume === 0) {
        newVolumeState = "off";
      } else if (newVolume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (
        !isFinishedRef.current &&
        videoIconStateRef.current.to !== newVolumeState
      ) {
        if (!changedWhileNotFinishedRef.current) {
          changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: newVolumeState,
      };

      const newPaths = bundleController.getPaths(
        videoIconStateRef.current.from,
        newVolumeState
      );
      if (newPaths[0]) {
        setPaths(newPaths);
      }
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

    if (!audioRef.current || clientMute.current) {
      return;
    }

    const newVolume = audioRef.current.volume;
    let newVolumeState;
    if (audioRef.current.muted || newVolume === 0) {
      newVolumeState = "off";
    } else if (audioRef.current.volume >= 0.5) {
      newVolumeState = "high";
    } else {
      newVolumeState = "low";
    }

    if (
      !isFinishedRef.current &&
      videoIconStateRef.current.to !== newVolumeState
    ) {
      if (!changedWhileNotFinishedRef.current) {
        changedWhileNotFinishedRef.current = true;
      }
      return;
    }

    if (videoIconStateRef.current.to !== newVolumeState) {
      const { from, to } = videoIconStateRef.current;
      videoIconStateRef.current = { from: to, to: newVolumeState };

      if (newVolumeState === "off") {
        audioRef.current.muted = true;

        if (!isFinishedRef.current) {
          if (!changedWhileNotFinishedRef.current) {
            changedWhileNotFinishedRef.current = true;
          }
          return;
        }

        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: "off",
        };

        const newPaths = bundleController.getPaths(
          videoIconStateRef.current.from,
          "off"
        );
        if (newPaths[0]) {
          setPaths(newPaths);
        }
      } else {
        audioRef.current.muted = false;

        const newVolume = audioRef.current.volume;
        let newVolumeState;
        if (newVolume === 0) {
          newVolumeState = "off";
        } else if (newVolume >= 0.5) {
          newVolumeState = "high";
        } else {
          newVolumeState = "low";
        }

        if (
          !isFinishedRef.current &&
          videoIconStateRef.current.to !== newVolumeState
        ) {
          if (!changedWhileNotFinishedRef.current) {
            changedWhileNotFinishedRef.current = true;
          }
          return;
        }

        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: newVolumeState,
        };

        const newPaths = bundleController.getPaths(
          videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths[0]) {
          setPaths(newPaths);
        }
      }

      const newPaths = bundleController.getPaths(to, newVolumeState);
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
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
    const trackColor = `linear-gradient(to right, ${primaryVolumeSliderColor} 0%, ${primaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} 100%)`;

    volumeSliders.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      sliderElement.style.background = trackColor;
    });
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!clientMute.current) {
        audioRef.current.muted = volume > 0 ? false : true;
      }
    }

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
            handleMute={handleMute}
            videoStream={cameraStream}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            tracksColorSetter={tracksColorSetter}
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
            handleMute={handleMute}
            videoStream={screenStream}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
            tracksColorSetter={tracksColorSetter}
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
