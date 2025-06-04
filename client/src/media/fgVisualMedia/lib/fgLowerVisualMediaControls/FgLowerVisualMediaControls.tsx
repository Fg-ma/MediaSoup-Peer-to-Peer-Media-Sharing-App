import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../../../universal/effectsTypeConstant";
import { IncomingMediasoupMessages } from "../../../../serverControllers/mediasoupServer/lib/typeConstant";
import FgLowerVisualMediaController from "./lib/FgLowerVisualMediaController";
import {
  defaultFgVisualMediaOptions,
  FgVisualMediaOptions,
} from "../typeConstant";
import FgSettingsButton from "./lib/fgSettingsButton/FgSettingsButton";
import CameraMedia from "../../CameraMedia";
import ScreenMedia from "../../ScreenMedia";
import RemoteVisualMedia from "../../RemoteVisualMedia";

const PlayPauseButton = React.lazy(
  () => import("./lib/playPauseButton/PlayPauseButton"),
);
const FgVolumeElement = React.lazy(
  () => import("../../../../elements/fgVolumeElement/FgVolumeElement"),
);
const FullScreenButton = React.lazy(
  () => import("./lib/fullScreenButton/FullScreenButton"),
);
const VisualEffectsButton = React.lazy(
  () => import("./lib/visualEffectsButton/VisualEffectsButton"),
);
const AudioEffectsButton = React.lazy(
  () => import("../../../../audioEffectsButton/AudioEffectsButton"),
);
const FgHoverContentStandard = React.lazy(
  () =>
    import(
      "../../../../elements/fgHoverContentStandard/FgHoverContentStandard"
    ),
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
  visualMedia,
  tableId,
  username,
  instance,
  type,
  visualMediaId,
  fgLowerVisualMediaController,
  pausedState,
  clientMute,
  screenAudioClientMute,
  localMute,
  screenAudioLocalMute,
  visualMediaContainerRef,
  audioStream,
  screenAudioStream,
  audioRef,
  subContainerRef,
  currentTimeRef,
  visualEffectsActive,
  audioEffectsActive,
  setAudioEffectsActive,
  fgVisualMediaOptions,
  handleVisualEffectChange,
  handleAudioEffectChange,
  handleMuteCallback,
  handleVolumeSliderCallback,
  tracksColorSetterCallback,
  settingsActive,
  setSettingsActive,
  setRerender,
}: {
  visualMedia: CameraMedia | ScreenMedia | RemoteVisualMedia;
  tableId: string;
  username: string;
  instance: string;
  type: "camera" | "screen";
  visualMediaId: string;
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
  pausedState: boolean;
  clientMute: React.MutableRefObject<boolean>;
  screenAudioClientMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  localMute: React.MutableRefObject<boolean>;
  screenAudioLocalMute: React.MutableRefObject<{
    [screenAudioId: string]: boolean;
  }>;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  audioStream?: MediaStream;
  screenAudioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  subContainerRef: React.RefObject<HTMLDivElement>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  visualEffectsActive: boolean;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  fgVisualMediaOptions: FgVisualMediaOptions;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean,
  ) => Promise<void>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes,
  ) => void;
  handleMuteCallback:
    | ((
        producerType: "audio" | "screenAudio",
        producerId: string | undefined,
      ) => void)
    | undefined;
  handleVolumeSliderCallback: (
    event: React.ChangeEvent<HTMLInputElement>,
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  tracksColorSetterCallback: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  settingsActive: boolean;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { mediasoupSocket } = useSocketContext();

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
  const rightVisualMediaControlsRef = useRef<HTMLDivElement>(null);

  const handleMessage = (event: IncomingMediasoupMessages) => {
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
    mediasoupSocket.current?.addMessageListener(handleMessage);

    rightVisualMediaControlsRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMessage);
      rightVisualMediaControlsRef.current?.removeEventListener(
        "wheel",
        handleWheel,
      );
    };
  }, []);

  return (
    <div className="visual-media-lower-controls pointer-events-none absolute bottom-[1%] left-0 z-20 flex h-[12%] max-h-12 min-h-6 w-full justify-between px-3">
      <div className="flex z-20 h-full w-max items-center space-x-2">
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
              tableId={tableId}
              username={username}
              instance={instance}
              isUser={
                fgVisualMediaOptions.isUser ??
                defaultFgVisualMediaOptions.isUser
              }
              producerType={screenAudioStream ? "screenAudio" : "audio"}
              producerId={
                screenAudioStream ? `${visualMediaId}_audio` : undefined
              }
              audioRef={audioRef}
              clientMute={clientMute}
              screenAudioClientMute={screenAudioClientMute}
              localMute={localMute}
              screenAudioLocalMute={screenAudioLocalMute}
              visualEffectsActive={visualEffectsActive}
              settingsActive={settingsActive}
              options={{
                isSlider: fgVisualMediaOptions.isSlider,
                initialVolume: fgVisualMediaOptions.initialVolume ?? "high",
              }}
              handleMuteCallback={() => {
                if (handleMuteCallback !== undefined) {
                  handleMuteCallback(
                    screenAudioStream ? "screenAudio" : "audio",
                    screenAudioStream ? `${visualMediaId}_audio` : undefined,
                  );
                }

                setRerender((prev) => !prev);
              }}
              handleVolumeSliderCallback={handleVolumeSliderCallback}
              tracksColorSetterCallback={tracksColorSetterCallback}
            />
          </Suspense>
        )}
        {fgVisualMediaOptions.isCurrentTime && (
          <div className="flex select-none items-center gap-1 px-1">
            <div ref={currentTimeRef} className="font-K2D text-lg"></div>
          </div>
        )}
      </div>
      <div
        ref={rightVisualMediaControlsRef}
        className="hide-scroll-bar z-10 flex h-full w-max scale-x-[-1] items-center space-x-2 overflow-x-auto pr-2"
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
        <FgSettingsButton
          username={username}
          instance={instance}
          visualMedia={visualMedia}
          type={type}
          visualMediaId={visualMediaId}
          fgVisualMediaOptions={fgVisualMediaOptions}
          visualEffectsActive={visualEffectsActive}
          visualMediaContainerRef={visualMediaContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          scrollingContainerRef={rightVisualMediaControlsRef}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
          setRerender={setRerender}
        />
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
              tableId={tableId}
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
                if (!screenAudioStream) {
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
                } else {
                  if (screenAudioClientMute.current[`${visualMediaId}_audio`]) {
                    return;
                  }

                  screenAudioLocalMute.current[`${visualMediaId}_audio`] =
                    !screenAudioLocalMute.current[`${visualMediaId}_audio`];

                  const audioElement = document.getElementById(
                    `${visualMediaId}_audio`,
                  ) as HTMLAudioElement | null;

                  if (!audioElement) {
                    return;
                  }

                  if (!fgVisualMediaOptions.isUser) {
                    audioElement.muted =
                      screenAudioLocalMute.current[`${visualMediaId}_audio`];
                  }
                }

                if (handleMuteCallback !== undefined) {
                  handleMuteCallback(
                    screenAudioStream ? "screenAudio" : "audio",
                    screenAudioStream ? `${visualMediaId}_audio` : undefined,
                  );
                }

                setRerender((prev) => !prev);
              }}
              clientMute={clientMute}
              screenAudioClientMute={screenAudioClientMute}
              localMute={localMute}
              screenAudioLocalMute={screenAudioLocalMute}
              visualMediaContainerRef={visualMediaContainerRef}
              closeLabelElement={
                <FgHoverContentStandard content="Close (x)" style="dark" />
              }
              hoverLabelElement={
                <FgHoverContentStandard
                  content="Audio effects (a)"
                  style="dark"
                />
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
  );
}
