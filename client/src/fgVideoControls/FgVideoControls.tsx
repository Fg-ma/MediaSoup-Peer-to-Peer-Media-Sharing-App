import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import Controls from "./lib/Controls";
import {
  defaultFgVideoOptions,
  FgVideoOptions,
  Settings,
} from "../fgVideo/FgVideo";

const PlayPauseButton = React.lazy(() => import("./lib/PlayPauseButton"));
const FgVolumeElement = React.lazy(
  () => import("../fgVolumeElement/FgVolumeElement")
);
const FullScreenButton = React.lazy(() => import("./lib/FullScreenButton"));
const TheaterButton = React.lazy(() => import("./lib/TheaterButton"));
const PictureInPictureButton = React.lazy(
  () => import("./lib/PictureInPictureButton")
);
const CaptionButton = React.lazy(() => import("./lib/CaptionButton"));
const FgSettingsButton = React.lazy(() => import("./lib/FgSettingsButton"));
const PlaybackSpeedButton = React.lazy(
  () => import("./lib/PlaybackSpeedButton")
);
const EffectsButton = React.lazy(() => import("./lib/EffectsButton"));
const VisualEffectsSection = React.lazy(
  () => import("../visualEffectsSection/VisualEffectsSection")
);
const AudioEffectsButton = React.lazy(
  () => import("../audioEffectsButton/AudioEffectsButton")
);

export type FontFamilies =
  | "K2D"
  | "Josephin"
  | "mono"
  | "sans"
  | "serif"
  | "thin"
  | "bold";

export type FontColors =
  | "white"
  | "black"
  | "red"
  | "green"
  | "blue"
  | "magenta"
  | "orange"
  | "cyan";

export type FontOpacities = "25%" | "50%" | "75%" | "100%";

export type FontSizes =
  | "xsmall"
  | "small"
  | "base"
  | "medium"
  | "large"
  | "xlarge";

export type BackgroundColors =
  | "white"
  | "black"
  | "red"
  | "green"
  | "blue"
  | "magenta"
  | "orange"
  | "cyan";

export type BackgroundOpacities = "25%" | "50%" | "75%" | "100%";

export type CharacterEdgeStyles =
  | "None"
  | "Shadow"
  | "Raised"
  | "Inset"
  | "Outline";

export interface ActivePages {
  closedCaption: {
    active: boolean;
    closedCaptionOptionsActive: {
      active: boolean;
      fontFamily: { active: boolean };
      fontColor: { active: boolean };
      fontOpacity: { active: boolean };
      fontSize: { active: boolean };
      backgroundColor: { active: boolean };
      backgroundOpacity: { active: boolean };
      characterEdgeStyle: { active: boolean };
    };
  };
}

export default function FgVideoControls({
  socket,
  table_id,
  username,
  instance,
  type,
  videoId,
  controls,
  clientMute,
  localMute,
  videoContainerRef,
  audioStream,
  audioRef,
  currentTimeRef,
  totalTimeRef,
  playbackSpeedButtonRef,
  tintColor,
  effectsActive,
  audioEffectsActive,
  setAudioEffectsActive,
  settings,
  setSettings,
  fgVideoOptions,
  handleVisualEffectChange,
  handleAudioEffectChange,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  type: "camera" | "screen";
  videoId: string;
  controls: Controls;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  totalTimeRef: React.RefObject<HTMLDivElement>;
  playbackSpeedButtonRef: React.RefObject<HTMLButtonElement>;
  tintColor: React.MutableRefObject<string>;
  effectsActive: boolean;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  fgVideoOptions: FgVideoOptions;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
  handleMuteCallback: (() => void) | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  tracksColorSetterCallback: () => void;
}) {
  const [settingsActive, setSettingsActive] = useState(false);
  const [activePages, setActivePages] = useState<ActivePages>({
    closedCaption: {
      active: false,
      closedCaptionOptionsActive: {
        active: false,
        fontFamily: { active: false },
        fontColor: { active: false },
        fontOpacity: { active: false },
        fontSize: { active: false },
        backgroundColor: { active: false },
        backgroundOpacity: { active: false },
        characterEdgeStyle: { active: false },
      },
    },
  });
  const [rerender, setRerender] = useState(0);
  const rightVideoControlsRef = useRef<HTMLDivElement>(null);
  const browserStandardSpeechRecognitionAvailable = useRef(true);

  const handleMessage = (event: any) => {
    if (event.type === "localMuteChange") {
      setRerender((prev) => prev + 1);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightVideoControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightVideoControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightVideoControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    socket.current.on("message", (event) => handleMessage(event));

    rightVideoControlsRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event) => handleMessage(event));

      rightVideoControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {effectsActive && (
            <Suspense fallback={<div>Loading...</div>}>
              <VisualEffectsSection
                username={username}
                instance={instance}
                type={type}
                videoId={videoId}
                socket={socket}
                isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
                acceptsVisualEffects={
                  fgVideoOptions.acceptsVisualEffects ??
                  defaultFgVideoOptions.acceptsVisualEffects
                }
                videoContainerRef={videoContainerRef}
                handleVisualEffectChange={handleVisualEffectChange}
                tintColor={tintColor}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
      <div className='video-controls w-full h-10 flex justify-between'>
        <div
          className='w-max h-10 z-20 flex items-center space-x-2'
          style={{ boxShadow: "20px 0 15px -12px rgba(0, 0, 0, 0.9)" }}
        >
          {(fgVideoOptions.isPlayPause ??
            defaultFgVideoOptions.isPlayPause) && (
            <Suspense fallback={<div>Loading...</div>}>
              <PlayPauseButton
                controls={controls}
                effectsActive={effectsActive}
                settingsActive={settingsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isVolume ?? defaultFgVideoOptions.isPlayPause) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgVolumeElement
                socket={socket}
                table_id={table_id}
                username={username}
                instance={instance}
                isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
                audioRef={audioRef}
                clientMute={clientMute}
                localMute={localMute}
                effectsActive={effectsActive}
                settingsActive={settingsActive}
                options={{
                  isSlider:
                    fgVideoOptions.isSlider ?? defaultFgVideoOptions.isSlider,
                  initialVolume: fgVideoOptions.initialVolume ?? "high",
                }}
                handleMuteCallback={() => {
                  if (handleMuteCallback !== undefined) {
                    handleMuteCallback();
                  }

                  setRerender((prev) => prev + 1);
                }}
                handleVolumeSliderCallback={handleVolumeSliderCallback}
                tracksColorSetterCallback={tracksColorSetterCallback}
              />
            </Suspense>
          )}
          <div className='duration-container flex items-center gap-1 px-1'>
            {(fgVideoOptions.isCurrentTime ??
              defaultFgVideoOptions.isCurrentTime) && (
              <div
                ref={currentTimeRef}
                className='current-time font-K2D text-lg'
              ></div>
            )}
          </div>
        </div>
        <div
          ref={rightVideoControlsRef}
          className='hide-scroll-bar w-max h-10 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          {(fgVideoOptions.isFullScreen ??
            defaultFgVideoOptions.isFullScreen) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FullScreenButton
                controls={controls}
                effectsActive={effectsActive}
                settingsActive={settingsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isPictureInPicture ??
            defaultFgVideoOptions.isPictureInPicture) && (
            <Suspense fallback={<div>Loading...</div>}>
              <PictureInPictureButton
                controls={controls}
                effectsActive={effectsActive}
                settingsActive={settingsActive}
              />
            </Suspense>
          )}
          {(fgVideoOptions.isClosedCaptions ??
            defaultFgVideoOptions.isClosedCaptions) &&
            fgVideoOptions.isVolume &&
            audioStream && (
              <Suspense fallback={<div>Loading...</div>}>
                <CaptionButton
                  controls={controls}
                  effectsActive={effectsActive}
                  settingsActive={settingsActive}
                  settings={settings}
                  audioStream={audioStream}
                  videoContainerRef={videoContainerRef}
                  browserStandardSpeechRecognitionAvailable={
                    browserStandardSpeechRecognitionAvailable
                  }
                />
              </Suspense>
            )}
          {
            <Suspense fallback={<div>Loading...</div>}>
              <FgSettingsButton
                effectsActive={effectsActive}
                videoContainerRef={videoContainerRef}
                settingsActive={settingsActive}
                setSettingsActive={setSettingsActive}
                activePages={activePages}
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
                browserStandardSpeechRecognitionAvailable={
                  browserStandardSpeechRecognitionAvailable
                }
              />
            </Suspense>
          }
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            fgVideoOptions.isEffects && (
              <Suspense fallback={<div>Loading...</div>}>
                <EffectsButton
                  controls={controls}
                  effectsActive={effectsActive}
                  settingsActive={settingsActive}
                />
              </Suspense>
            )}
          {(fgVideoOptions.isUser || fgVideoOptions.acceptsVisualEffects) &&
            fgVideoOptions.isVolume && (
              <Suspense fallback={<div>Loading...</div>}>
                <AudioEffectsButton
                  socket={socket}
                  username={username}
                  instance={instance}
                  isUser={fgVideoOptions.isUser ?? defaultFgVideoOptions.isUser}
                  audioEffectsActive={audioEffectsActive}
                  setAudioEffectsActive={setAudioEffectsActive}
                  handleAudioEffectChange={handleAudioEffectChange}
                  handleMute={() => {
                    if (clientMute.current) {
                      return;
                    }

                    localMute.current = !localMute.current;

                    if (!audioRef.current) {
                      return;
                    }

                    if (!fgVideoOptions.isUser) {
                      audioRef.current.muted = localMute.current;
                    }

                    if (handleMuteCallback !== undefined) {
                      handleMuteCallback();
                    }

                    setRerender((prev) => prev + 1);
                  }}
                  muteStateRef={localMute}
                  videoContainerRef={videoContainerRef}
                  closeLabelElement={
                    <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md shadow-lg rounded-md relative bottom-0 bg-white'>
                      Close (x)
                    </div>
                  }
                  hoverLabelElement={
                    <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
                      Audio effects (a)
                    </div>
                  }
                  style={{ transform: "scaleX(-1)" }}
                  options={{
                    backgroundColor: "rgba(10, 10, 10, 1)",
                    secondaryBackgroundColor: "rgba(35, 35, 35, 1)",
                  }}
                />
              </Suspense>
            )}
        </div>
      </div>
    </div>
  );
}
