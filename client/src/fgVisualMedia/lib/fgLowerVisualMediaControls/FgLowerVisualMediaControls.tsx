import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AnimatePresence } from "framer-motion";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../context/effectsContext/typeConstant";
import FgLowerVisualMediaController from "./lib/FgLowerVisualMediaController";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
  Settings,
} from "../typeConstant";

const PlayPauseButton = React.lazy(
  () => import("./lib/playPauseButton/PlayPauseButton")
);
const FgVolumeElement = React.lazy(
  () => import("../../../fgVolumeElement/FgVolumeElement")
);
const FullScreenButton = React.lazy(
  () => import("./lib/fullScreenButton/FullScreenButton")
);
const PictureInPictureButton = React.lazy(
  () => import("./lib/pictureInPictureButton/PictureInPictureButton")
);
const CaptionButton = React.lazy(
  () => import("./lib/captionsButton/CaptionButton")
);
const FgSettingsButton = React.lazy(
  () => import("./lib/fgSettingsButton/FgSettingsButton")
);
const VisualEffectsButton = React.lazy(
  () => import("./lib/visualEffectsButton/VisualEffectsButton")
);
const VisualEffectsSection = React.lazy(
  () => import("../visualEffectsSection/VisualEffectsSection")
);
const AudioEffectsButton = React.lazy(
  () => import("../../../audioEffectsButton/AudioEffectsButton")
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

export default function FgLowerVisualMediaControls({
  socket,
  table_id,
  username,
  instance,
  type,
  visualMediaId,
  fgLowerVisualMediaController,
  pausedState,
  clientMute,
  localMute,
  visualMediaContainerRef,
  audioStream,
  screenAudioStream,
  audioRef,
  subContainerRef,
  currentTimeRef,
  tintColor,
  visualEffectsActive,
  audioEffectsActive,
  setAudioEffectsActive,
  settings,
  setSettings,
  fgVisualMediaOptions,
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
  visualMediaId: string;
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  pausedState: boolean;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  audioStream?: MediaStream;
  screenAudioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  subContainerRef: React.RefObject<HTMLDivElement>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  tintColor: React.MutableRefObject<string>;
  visualEffectsActive: boolean;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  fgVisualMediaOptions: FgVisualMediaOptions;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
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
  const [_, setRerender] = useState(false);
  const rightVisualMediaControlsRef = useRef<HTMLDivElement>(null);

  const handleMessage = (event: { type: "localMuteChange" }) => {
    if (event.type === "localMuteChange") {
      setRerender((prev) => !prev);
    }
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (rightVisualMediaControlsRef.current) {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        rightVisualMediaControlsRef.current.scrollLeft -= event.deltaX / 2;
      } else {
        rightVisualMediaControlsRef.current.scrollLeft -= event.deltaY / 2;
      }
    }
  };

  useEffect(() => {
    socket.current.on("message", (event) => handleMessage(event));

    rightVisualMediaControlsRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      socket.current.off("message", (event) => handleMessage(event));

      rightVisualMediaControlsRef.current?.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20 pointer-events-none'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {visualEffectsActive && (
            <Suspense fallback={<div>Loading...</div>}>
              <VisualEffectsSection
                username={username}
                instance={instance}
                type={type}
                visualMediaId={visualMediaId}
                socket={socket}
                isUser={
                  fgVisualMediaOptions.isUser ??
                  defaultFgVisualMediaOptions.isUser
                }
                acceptsVisualEffects={
                  type === "camera"
                    ? fgVisualMediaOptions.permissions?.acceptsCameraEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsCameraEffects
                    : fgVisualMediaOptions.permissions?.acceptsScreenEffects ??
                      defaultFgVisualMediaOptions.permissions
                        .acceptsScreenEffects
                }
                visualMediaContainerRef={visualMediaContainerRef}
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
          {fgVisualMediaOptions.isPlayPause && (
            <Suspense fallback={<div>Loading...</div>}>
              <PlayPauseButton
                pausedState={pausedState}
                fgLowerVisualMediaController={fgLowerVisualMediaController}
                visualEffectsActive={visualEffectsActive}
                settingsActive={settingsActive}
              />
            </Suspense>
          )}
          {(fgVisualMediaOptions.isVolume ||
            (screenAudioStream &&
              (fgVisualMediaOptions.isUser ||
                fgVisualMediaOptions.permissions
                  ?.acceptsScreenAudioEffects))) && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgVolumeElement
                socket={socket}
                table_id={table_id}
                username={username}
                instance={instance}
                isUser={
                  fgVisualMediaOptions.isUser ??
                  defaultFgVisualMediaOptions.isUser
                }
                audioRef={audioRef}
                clientMute={clientMute}
                localMute={localMute}
                visualEffectsActive={visualEffectsActive}
                settingsActive={settingsActive}
                options={{
                  isSlider: fgVisualMediaOptions.isSlider,
                  initialVolume: fgVisualMediaOptions.initialVolume ?? "high",
                }}
                handleMuteCallback={() => {
                  if (handleMuteCallback !== undefined) {
                    handleMuteCallback();
                  }

                  setRerender((prev) => !prev);
                }}
                handleVolumeSliderCallback={handleVolumeSliderCallback}
                tracksColorSetterCallback={tracksColorSetterCallback}
              />
            </Suspense>
          )}
          {fgVisualMediaOptions.isCurrentTime && (
            <div className='flex items-center gap-1 px-1 select-none'>
              <div ref={currentTimeRef} className='font-K2D text-lg'></div>
            </div>
          )}
        </div>
        <div
          ref={rightVisualMediaControlsRef}
          className='hide-scroll-bar w-max h-10 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          {fgVisualMediaOptions.isFullScreen && (
            <Suspense fallback={<div>Loading...</div>}>
              <FullScreenButton
                fgLowerVisualMediaController={fgLowerVisualMediaController}
                visualEffectsActive={visualEffectsActive}
                settingsActive={settingsActive}
                scrollingContainerRef={rightVisualMediaControlsRef}
              />
            </Suspense>
          )}
          {fgVisualMediaOptions.isPictureInPicture && (
            <Suspense fallback={<div>Loading...</div>}>
              <PictureInPictureButton
                fgLowerVisualMediaController={fgLowerVisualMediaController}
                visualEffectsActive={visualEffectsActive}
                settingsActive={settingsActive}
                scrollingContainerRef={rightVisualMediaControlsRef}
              />
            </Suspense>
          )}
          {fgVisualMediaOptions.isClosedCaptions &&
            fgVisualMediaOptions.isVolume &&
            audioStream && (
              <Suspense fallback={<div>Loading...</div>}>
                <CaptionButton
                  fgLowerVisualMediaController={fgLowerVisualMediaController}
                  visualEffectsActive={visualEffectsActive}
                  settingsActive={settingsActive}
                  settings={settings}
                  audioStream={audioStream}
                  visualMediaContainerRef={visualMediaContainerRef}
                  scrollingContainerRef={rightVisualMediaControlsRef}
                  containerRef={subContainerRef}
                />
              </Suspense>
            )}
          {fgVisualMediaOptions.isVolume && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgSettingsButton
                fgVisualMediaOptions={fgVisualMediaOptions}
                visualEffectsActive={visualEffectsActive}
                visualMediaContainerRef={visualMediaContainerRef}
                settingsActive={settingsActive}
                setSettingsActive={setSettingsActive}
                activePages={activePages}
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
                scrollingContainerRef={rightVisualMediaControlsRef}
              />
            </Suspense>
          )}
          {(fgVisualMediaOptions.isUser ||
            (type === "camera" &&
              fgVisualMediaOptions.permissions?.acceptsCameraEffects) ||
            (type === "screen" &&
              fgVisualMediaOptions.permissions?.acceptsScreenEffects)) &&
            fgVisualMediaOptions.isEffects && (
              <Suspense fallback={<div>Loading...</div>}>
                <VisualEffectsButton
                  fgLowerVisualMediaController={fgLowerVisualMediaController}
                  visualEffectsActive={visualEffectsActive}
                  settingsActive={settingsActive}
                  scrollingContainerRef={rightVisualMediaControlsRef}
                />
              </Suspense>
            )}
          {(((fgVisualMediaOptions.isUser ||
            fgVisualMediaOptions.permissions?.acceptsAudioEffects) &&
            fgVisualMediaOptions.isVolume) ||
            ((fgVisualMediaOptions.isUser ||
              fgVisualMediaOptions.permissions?.acceptsScreenAudioEffects) &&
              screenAudioStream)) && (
            <Suspense fallback={<div>Loading...</div>}>
              <AudioEffectsButton
                socket={socket}
                table_id={table_id}
                username={username}
                instance={instance}
                isUser={
                  fgVisualMediaOptions.isUser ??
                  defaultFgVisualMediaOptions.isUser
                }
                permissions={
                  fgVisualMediaOptions.permissions ??
                  defaultFgVisualMediaOptions.permissions
                }
                producerType={screenAudioStream ? "screenAudio" : "audio"}
                producerId={
                  screenAudioStream ? `${visualMediaId}_audio` : undefined
                }
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

                  if (!fgVisualMediaOptions.isUser) {
                    audioRef.current.muted = localMute.current;
                  }

                  if (handleMuteCallback !== undefined) {
                    handleMuteCallback();
                  }

                  setRerender((prev) => !prev);
                }}
                localMute={localMute}
                clientMute={clientMute}
                visualMediaContainerRef={visualMediaContainerRef}
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
                scrollingContainerRef={rightVisualMediaControlsRef}
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
