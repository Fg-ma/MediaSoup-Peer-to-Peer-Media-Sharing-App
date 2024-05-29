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
import VolumeSection from "./VolumeSection";
import VolumeIndicator from "./VolumeIndicator";

export default function ({
  username,
  roomName,
  socket,
  cameraStreams,
  screenStreams,
  audioStream,
  isAudio = true,
  isUser = false,
  primaryVolumeSliderColor = "white",
  secondaryVolumeSliderColor = "rgba(150, 150, 150, 0.5)",
  muteButtonCallback,
  initialVolume = "high",
  onRendered,
}: {
  username?: string;
  roomName: string;
  socket: React.MutableRefObject<Socket>;
  cameraStreams?: { [cameraKey: string]: MediaStream };
  screenStreams?: { [screenKey: string]: MediaStream };
  audioStream?: MediaStream;
  isAudio?: boolean;
  isUser?: boolean;
  primaryVolumeSliderColor?: string;
  secondaryVolumeSliderColor?: string;
  tertiaryVolumeSliderColor?: string;
  quaternaryVolumeSliderColor?: string;
  muteButtonCallback?: any;
  initialVolume?: string;
  onRendered?: () => any;
}) {
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
  const isAudioMuted = useRef(false);

  useEffect(() => {
    if (audioRef.current && audioStream && isAudio) {
      audioRef.current.srcObject = audioStream;
    }

    // Set initial volume slider
    tracksColorSetter();

    audioRef.current?.addEventListener("volumechange", volumeChangeHandler);

    return () => {
      audioRef.current?.removeEventListener(
        "volumechange",
        volumeChangeHandler
      );
    };
  }, [audioRef]);

  const volumeChangeHandler = () => {
    if (!audioRef.current || muteLock.current) {
      return;
    }

    if (!audioRef.current.muted) {
      const volumeSliders =
        bundleRef.current?.querySelectorAll(".volume-slider");

      volumeSliders?.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        if (audioRef.current) {
          sliderElement.value = audioRef.current.volume.toString();
        }
      });
    }

    tracksColorSetter();

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
        bundleRef.current?.classList.add("mute");
      } else {
        bundleRef.current?.classList.remove("mute");
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
      if (isAudioMuted.current) {
        value = 0;
      }
      const min = 0;
      const max = 1;
      const percentage = ((value - min) / (max - min)) * 100;
      const trackColor = `linear-gradient(to right, ${primaryVolumeSliderColor} 0%, ${primaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} 100%)`;
      if (audioStream && !cameraStreams && !screenStreams) {
        bundleRef.current?.style.setProperty(
          "--volume-slider-thumb-size",
          "1.5rem"
        );
      }

      volumeSliders.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.style.background = trackColor;
        sliderElement.style.borderRadius =
          audioStream && !cameraStreams && !screenStreams
            ? "0.3125rem"
            : "0.125rem";
      });
    }
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
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
    if (!audioRef.current || muteLock.current) {
      return;
    }

    isAudioMuted.current = !isAudioMuted.current;

    if (audioRef.current && audioRef.current.srcObject instanceof MediaStream) {
      const mediaStream = audioRef.current.srcObject;
      mediaStream.getAudioTracks().forEach((track) => {
        if (audioRef.current) {
          track.enabled = audioRef.current.muted;
        }
      });

      audioRef.current.muted = !audioRef.current.muted;
    }
    if (isAudioMuted.current) {
      bundleRef.current?.classList.add("mute");
      const volumeSliders =
        bundleRef.current?.querySelectorAll(".volume-slider");

      volumeSliders?.forEach((slider) => {
        const sliderElement = slider as HTMLInputElement;
        sliderElement.value = "0";
      });
    } else {
      bundleRef.current?.classList.remove("mute");
    }

    tracksColorSetter();

    if (muteButtonCallback) {
      muteButtonCallback();
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

  useEffect(() => {
    if (!bundleRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const targetElement = mutation.target as Element;
          const oldClass = mutation.oldValue;
          const newClass = targetElement.className;

          // Compare old and new class names
          const oldClassList: string[] | undefined = oldClass?.split(" ");
          const newClassList: string[] = newClass.split(" ");

          // Find added classes
          const addedClasses = newClassList.filter(
            (cls: string) => !oldClassList?.includes(cls)
          );

          // Find removed classes
          const removedClasses = oldClassList?.filter(
            (cls: string) => !newClassList.includes(cls)
          );

          if (
            addedClasses.includes("mute") &&
            videoIconStateRef.current.to !== "off"
          ) {
            videoIconStateRef.current = {
              from: videoIconStateRef.current.to,
              to: "off",
            };

            const newPaths = getPaths(videoIconStateRef.current.from, "off");
            if (newPaths[0]) {
              setPaths(newPaths);
            }
          } else if (
            removedClasses?.includes("mute") &&
            videoIconStateRef.current.to === "off"
          ) {
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

          if (addedClasses.includes("mute-lock") && !muteLock.current) {
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
          } else if (
            removedClasses?.includes("mute-lock") &&
            muteLock.current
          ) {
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
        }
      });
    });

    observer.observe(bundleRef.current, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["class"],
    });

    // Cleanup function to disconnect the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  // Initial functions & call onRendered call back if one is availiable
  useEffect(() => {
    if (audioStream && !cameraStreams && !screenStreams) {
      bundleRef.current?.style.setProperty(
        "--volume-slider-height",
        "0.625rem"
      );
      bundleRef.current?.style.setProperty("--volume-slider-width", "8rem");
    }

    if (onRendered) {
      onRendered();
    }
  }, []);

  return (
    <div
      ref={bundleRef}
      id={username && `${username}_bundle_container`}
      className='bundle-container'
    >
      {cameraStreams &&
        Object.keys(cameraStreams).length !== 0 &&
        Object.entries(cameraStreams).map(([key, cameraStream]) => (
          <FgVideo
            key={key}
            username={username}
            roomName={roomName}
            socket={socket}
            id={key}
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
            initialMute={false}
            handleMute={handleMute}
            muteLock={muteLock}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
          />
        ))}
      {screenStreams &&
        Object.keys(screenStreams).length !== 0 &&
        Object.entries(screenStreams).map(([key, screenStream]) => (
          <FgVideo
            key={key}
            username={username}
            roomName={roomName}
            socket={socket}
            id={key}
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
            initialMute={false}
            handleMute={handleMute}
            muteLock={muteLock}
            audioRef={audioRef}
            handleVolumeSlider={handleVolumeSlider}
            paths={paths}
            videoIconStateRef={videoIconStateRef}
            isFinishedRef={isFinishedRef}
            changedWhileNotFinishedRef={changedWhileNotFinishedRef}
          />
        ))}
      {audioStream &&
        Object.keys(cameraStreams || {}).length === 0 &&
        Object.keys(screenStreams || {}).length === 0 && (
          <div
            id={username && `${username}_audio_container`}
            className='relative'
          >
            <audio
              ref={audioRef}
              id={username && `${username}_audio_stream`}
              className='w-0 z-0'
              autoPlay={true}
            ></audio>
            <VolumeIndicator
              audioStream={audioStream}
              audioRef={audioRef}
              handleMute={handleMute}
              isUser={isUser}
            />
          </div>
        )}
      {audioStream &&
        (Object.keys(cameraStreams || {}).length !== 0 ||
          Object.keys(screenStreams || {}).length !== 0) && (
          <audio
            ref={audioRef}
            id={username && `${username}_audio_stream`}
            className='w-0 z-0'
            autoPlay={true}
          ></audio>
        )}
    </div>
  );
}
