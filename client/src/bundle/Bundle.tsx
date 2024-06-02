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
  volumeLow1a,
  volumeLow1b,
  volumeLow2a,
  volumeLow2b,
  volumeLow3a,
  volumeLow3b,
  volumeHighLowIB1a,
  volumeHighLowIB1b,
  volumeHighLowIB2a,
  volumeHighLowIB2b,
  volumeHighLowIB3a,
  volumeHighLowIB3b,
  volumeLowOffA1a,
  volumeLowOffA1b,
  volumeLowOffA2a,
  volumeLowOffA2b,
  volumeLowOffA3a,
  volumeLowOffA3b,
  volumeLowOffB1a,
  volumeLowOffB1b,
  volumeLowOffB2a,
  volumeLowOffB2b,
  volumeLowOffB3a,
  volumeLowOffB3b,
} from "./svgPaths";
import FgVideo from "./FgVideo";
import VolumeIndicator from "./VolumeIndicator";
import { useStreamsContext } from "../context/StreamsContext";

export default function ({
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
  const {
    userCameraStreams,
    userCameraCount,
    userScreenStreams,
    userScreenCount,
    userAudioStream,
    remoteTracksMap,
  } = useStreamsContext();
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
  const muteLock = useRef(false);
  const videoIconStateRef = useRef({ from: "", to: initialVolume });
  const isFinishedRef = useRef(true);
  const changedWhileNotFinishedRef = useRef(false);
  const localMuted = useRef(false);

  const onProducerDisconnected = (event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  }) => {
    if (event.producerUsername === username) {
      if (event.producerType === "webcam") {
        setCameraStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "screen") {
        setScreenStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[event.producerId];
          return newStreams;
        });
      } else if (event.producerType === "audio") {
        setAudioStream(undefined);
      }
    }
  };

  const onNewProducerWasCreated = (event: {
    type: string;
    producerType: "webcam" | "screen" | "audio";
  }) => {
    if (!isUser) {
      return;
    }

    if (event.producerType === "webcam") {
      setCameraStreams((prev) => {
        const newStreams = { ...prev };
        newStreams[`${username}_camera_stream_${userCameraCount.current}`] =
          userCameraStreams.current[
            `${username}_camera_stream_${userCameraCount.current}`
          ];
        return newStreams;
      });
    } else if (event.producerType === "screen") {
      setScreenStreams((prev) => {
        const newStreams = { ...prev };
        newStreams[`${username}_screen_stream_${userScreenCount.current}`] =
          userScreenStreams.current[
            `${username}_screen_stream_${userScreenCount.current}`
          ];
        return newStreams;
      });
    } else if (event.producerType === "audio") {
      setAudioStream(userAudioStream.current);
    }
  };

  const onNewConsumerWasCreated = async (event: {
    type: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
  }) => {
    if (username !== event.producerUsername) {
      return;
    }

    if (event.consumerType === "webcam") {
      setCameraStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            remoteTracksMap.current[event.producerUsername].webcam?.[
              event.consumerId
            ];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "screen") {
      setScreenStreams((prev) => {
        const newStreams = { ...prev };
        const newStream = new MediaStream();
        if (event.consumerId) {
          const track =
            remoteTracksMap.current[event.producerUsername].screen?.[
              event.consumerId
            ];
          if (track) {
            newStream.addTrack(track);
          }

          newStreams[event.consumerId] = newStream;
        }
        return newStreams;
      });
    } else if (event.consumerType === "audio") {
      const newStream = new MediaStream();
      const track = remoteTracksMap.current[event.producerUsername].audio;
      if (track) {
        newStream.addTrack(track);
      }

      setAudioStream(newStream);
    }
  };

  const onAcceptedMuteLock = (event: {
    type: string;
    producerUsername: string;
  }) => {
    if (isUser || username !== event.producerUsername) {
      return;
    }

    muteLock.current = true;

    if (videoIconStateRef.current.to !== "off") {
      videoIconStateRef.current = {
        from: videoIconStateRef.current.to,
        to: "off",
      };
      const newPaths = getPaths(videoIconStateRef.current.from, "off");
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  };

  const onMuteLockChange = (event: {
    type: string;
    isMuteLock: boolean;
    username: string;
  }) => {
    if (isUser || username !== event.username) {
      return;
    }

    if (event.isMuteLock) {
      if (!isFinishedRef.current) {
        if (!changedWhileNotFinishedRef.current) {
          changedWhileNotFinishedRef.current = true;
        }
        return;
      }

      muteLock.current = true;

      if (videoIconStateRef.current.to !== "off") {
        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: "off",
        };
        const newPaths = getPaths(videoIconStateRef.current.from, "off");
        if (newPaths[0]) {
          setPaths(newPaths);
        }
      }
    } else {
      muteLock.current = false;

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

      if (
        newVolumeState !== videoIconStateRef.current.to &&
        !audioRef.current.muted
      ) {
        videoIconStateRef.current = {
          from: videoIconStateRef.current.to,
          to: newVolumeState,
        };

        const newPaths = getPaths(
          videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths[0]) {
          setPaths(newPaths);
        }
      }
    }
  };

  const onMuteRequest = () => {
    localMuted.current = !localMuted.current;

    if (localMuted.current) {
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

      const newPaths = getPaths(videoIconStateRef.current.from, "off");
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

      const newPaths = getPaths(videoIconStateRef.current.from, newVolumeState);
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  };

  useEffect(() => {
    const handleMessage = (event: any) => {
      switch (event.type) {
        case "producerDisconnected":
          onProducerDisconnected(event);
          break;
        case "newProducerWasCreated":
          onNewProducerWasCreated(event);
          break;
        case "newConsumerWasCreated":
          onNewConsumerWasCreated(event);
          break;
        case "acceptedMuteLock":
          onAcceptedMuteLock(event);
          break;
        case "muteLockChange":
          onMuteLockChange(event);
          break;
        case "muteRequest":
          onMuteRequest();
          break;
        default:
          break;
      }
    };

    socket.current.on("message", handleMessage);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", handleMessage);
    };
  }, []);

  // Initial functions & call onRendered call back if one is availiable
  useEffect(() => {
    // Set initial volume slider
    tracksColorSetter();

    if (onRendered) {
      onRendered();
    }
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

  const volumeChangeHandler = () => {
    const volumeSliders = bundleRef.current?.querySelectorAll(".volume-slider");

    volumeSliders?.forEach((slider) => {
      const sliderElement = slider as HTMLInputElement;
      if (audioRef.current) {
        sliderElement.value = audioRef.current.muted
          ? "0"
          : audioRef.current.volume.toString();
      }
    });
    tracksColorSetter();

    if (!audioRef.current || muteLock.current) {
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

        const newPaths = getPaths(videoIconStateRef.current.from, "off");
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

        const newPaths = getPaths(
          videoIconStateRef.current.from,
          newVolumeState
        );
        if (newPaths[0]) {
          setPaths(newPaths);
        }
      }

      const newPaths = getPaths(to, newVolumeState);
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  };

  const tracksColorSetter = () => {
    if (bundleRef.current && audioRef.current) {
      const volumeSliders =
        bundleRef.current.querySelectorAll(".volume-slider");

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
    }
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (!muteLock.current) {
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

  const handleMute = () => {
    if (muteButtonCallback) {
      muteButtonCallback();
    }

    if (muteLock.current) {
      return;
    }

    localMuted.current = !localMuted.current;

    if (audioRef.current && !isUser) {
      audioRef.current.muted = localMuted.current;
    }

    if (
      audioRef.current &&
      audioRef.current.srcObject instanceof MediaStream &&
      !isUser
    ) {
      const mediaStream = audioRef.current.srcObject;
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !localMuted.current;
      });
    }

    if (localMuted.current) {
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

      const newPaths = getPaths(videoIconStateRef.current.from, "off");
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

      const newPaths = getPaths(videoIconStateRef.current.from, newVolumeState);
      if (newPaths[0]) {
        setPaths(newPaths);
      }
    }
  };

  const getPaths = (from: string, to: string) => {
    let newPaths: string[][] = [];
    if (from === "high" && to === "off") {
      newPaths = [
        [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
        [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
        [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
        [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
        [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
        [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
      ];
    } else if (from === "off" && to === "high") {
      newPaths = [
        [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
        [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
        [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
        [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
        [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
        [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
      ];
    } else if (from === "low" && to === "off") {
      newPaths = [
        [volumeLow1a, volumeLowOffA1a, volumeLowOffB1a, volumeOff1a],
        [volumeLow1b, volumeLowOffA1b, volumeLowOffB1b, volumeOff1b],
        [volumeLow2a, volumeLowOffA2a, volumeLowOffB2a, volumeOff2a],
        [volumeLow2b, volumeLowOffA2b, volumeLowOffB2b, volumeOff2b],
        [volumeLow3a, volumeLowOffA3a, volumeLowOffB3a, volumeOff3a],
        [volumeLow3b, volumeLowOffA3b, volumeLowOffB3b, volumeOff3b],
      ];
    } else if (from === "off" && to === "low") {
      newPaths = [
        [volumeOff1a, volumeLowOffB1a, volumeLowOffA1a, volumeLow1a],
        [volumeOff1b, volumeLowOffB1b, volumeLowOffA1b, volumeLow1b],
        [volumeOff2a, volumeLowOffB2a, volumeLowOffA2a, volumeLow2a],
        [volumeOff2b, volumeLowOffB2b, volumeLowOffA2b, volumeLow2b],
        [volumeOff3a, volumeLowOffB3a, volumeLowOffA3a, volumeLow3a],
        [volumeOff3b, volumeLowOffB3b, volumeLowOffA3b, volumeLow3b],
      ];
    } else if (from === "high" && to === "low") {
      newPaths = [
        [volumeHigh1a, volumeHighLowIB1a, volumeLow1a],
        [volumeHigh1b, volumeHighLowIB1b, volumeLow1b],
        [volumeHigh2a, volumeHighLowIB2a, volumeLow2a],
        [volumeHigh2b, volumeHighLowIB2b, volumeLow2b],
        [volumeHigh3a, volumeHighLowIB3a, volumeLow3a],
        [volumeHigh3b, volumeHighLowIB3b, volumeLow3b],
      ];
    } else if (from === "low" && to === "high") {
      newPaths = [
        [volumeLow1a, volumeHighLowIB1a, volumeHigh1a],
        [volumeLow1b, volumeHighLowIB1b, volumeHigh1b],
        [volumeLow2a, volumeHighLowIB2a, volumeHigh2a],
        [volumeLow2b, volumeHighLowIB2b, volumeHigh2b],
        [volumeLow3a, volumeHighLowIB3a, volumeHigh3a],
        [volumeLow3b, volumeHighLowIB3b, volumeHigh3b],
      ];
    }
    return newPaths;
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
            username={username}
            table_id={table_id}
            socket={socket}
            videoId={key}
            videoStream={cameraStream}
            isStream={true}
            flipVideo={true}
            isSlider={!isUser}
            isPlayPause={false}
            isVolume={audioStream ? true : false}
            isTotalTime={false}
            isPlaybackSpeed={false}
            isClosedCaptions={false}
            isPictureInPicture={true}
            isTheater={false}
            isFullScreen={true}
            isTimeLine={false}
            isSkip={false}
            isThumbnail={false}
            isPreview={false}
            handleMute={handleMute}
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
            username={username}
            table_id={table_id}
            socket={socket}
            videoId={key}
            videoStream={screenStream}
            isStream={true}
            flipVideo={false}
            isSlider={!isUser}
            isPlayPause={false}
            isVolume={audioStream ? true : false}
            isTotalTime={false}
            isPlaybackSpeed={false}
            isClosedCaptions={false}
            isPictureInPicture={true}
            isTheater={false}
            isFullScreen={true}
            isTimeLine={false}
            isSkip={false}
            isThumbnail={false}
            isPreview={false}
            handleMute={handleMute}
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
            <VolumeIndicator
              audioStream={audioStream}
              audioRef={audioRef}
              username={username}
              handleMute={handleMute}
              localMuted={localMuted}
              isUser={isUser}
              muteLock={muteLock}
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
