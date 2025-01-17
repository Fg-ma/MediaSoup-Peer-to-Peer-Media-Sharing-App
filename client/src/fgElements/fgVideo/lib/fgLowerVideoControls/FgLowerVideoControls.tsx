import React, { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSocketContext } from "../../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../../context/userInfoContext/UserInfoContext";
import { IncomingMediasoupMessages } from "../../../../lib/MediasoupSocketController";
import FgLowerVideoController from "./lib/FgLowerVideoController";
import { FgVideoOptions, Settings } from "../typeConstant";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import PlayPauseButton from "./lib/playPauseButton/PlayPauseButton";
import FgVolumeElement from "../../../../fgVolumeElement/FgVolumeElement";
import FullScreenButton from "./lib/fullScreenButton/FullScreenButton";
import PictureInPictureButton from "./lib/pictureInPictureButton/PictureInPictureButton";
import CaptionButton from "./lib/captionsButton/CaptionButton";
import FgSettingsButton from "./lib/fgSettingsButton/FgSettingsButton";
import VideoEffectsButton from "./lib/videoEffectsButton/VideoEffectsButton";
import AudioEffectsButton from "../../../../audioEffectsButton/AudioEffectsButton";
import VideoMedia from "../../../../lib/VideoMedia";
import { AudioEffectTypes } from "src/context/effectsContext/typeConstant";

const VideoEffectsSection = React.lazy(
  () => import("../videoEffectsSection/VideoEffectsSection")
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

export default function FgLowerVideoControls({
  videoId,
  videoMedia,
  fgLowerVideoController,
  pausedState,
  videoContentMute,
  videoContainerRef,
  subContainerRef,
  currentTimeRef,
  tintColor,
  videoEffectsActive,
  audioEffectsActive,
  setAudioEffectsActive,
  settings,
  setSettings,
  fgVideoOptions,
}: {
  videoId: string;
  videoMedia: VideoMedia;
  fgLowerVideoController: FgLowerVideoController;
  pausedState: boolean;
  videoContentMute: React.MutableRefObject<{
    [videoId: string]: boolean;
  }>;
  videoContainerRef: React.RefObject<HTMLDivElement>;
  subContainerRef: React.RefObject<HTMLDivElement>;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  tintColor: React.MutableRefObject<string>;
  videoEffectsActive: boolean;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  fgVideoOptions: FgVideoOptions;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance } = useUserInfoContext();

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
  const rightVideoControlsRef = useRef<HTMLDivElement>(null);

  const handleMessage = (event: IncomingMediasoupMessages) => {
    if (event.type === "localMuteChange") {
      setRerender((prev) => !prev);
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
    mediasoupSocket.current?.addMessageListener(handleMessage);

    rightVideoControlsRef.current?.addEventListener("wheel", handleWheel);

    // Cleanup event listener on unmount
    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMessage);
      rightVideoControlsRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleAudioEffectChange = (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => {};

  const handleMute = (
    producerType: "audio" | "screenAudio" | "video",
    producerId: string | undefined
  ) => {};

  return (
    <div className='video-controls-container absolute bottom-0 w-full h-max flex-col items-end justify-center z-20 pointer-events-none'>
      <div className='relative pointer-events-auto'>
        <AnimatePresence>
          {videoEffectsActive && (
            <Suspense fallback={<div>Loading...</div>}>
              <VideoEffectsSection
                videoId={videoId}
                videoContainerRef={videoContainerRef}
                fgLowerVideoController={fgLowerVideoController}
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
          <PlayPauseButton
            pausedState={pausedState}
            fgLowerVideoController={fgLowerVideoController}
            videoEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
          />
          {/* <FgVolumeElement
            table_id={table_id.current}
            username={username.current}
            instance={instance.current}
            isUser={false}
            producerType={"staticAudio"}
            producerId={undefined}
            audioRef={audioRef}
            clientMute={clientMute}
            screenAudioClientMute={screenAudioClientMute}
            localMute={localMute}
            screenAudioLocalMute={screenAudioLocalMute}
            visualEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
            options={{
              isSlider: true,
              initialVolume: fgVideoOptions.initialVolume ?? "high",
            }}
          /> */}
          <div className='flex items-center gap-1 px-1 select-none'>
            <div ref={currentTimeRef} className='font-K2D text-lg'></div>
          </div>
        </div>
        <div
          ref={rightVideoControlsRef}
          className='hide-scroll-bar w-max h-10 overflow-x-auto z-10 flex items-center space-x-2 scale-x-[-1] pr-2'
        >
          <FullScreenButton
            fgLowerVideoController={fgLowerVideoController}
            videoEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
            scrollingContainerRef={rightVideoControlsRef}
          />
          <PictureInPictureButton
            fgLowerVideoController={fgLowerVideoController}
            videoEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
            scrollingContainerRef={rightVideoControlsRef}
          />
          <CaptionButton
            fgLowerVideoController={fgLowerVideoController}
            videoEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
            settings={settings}
            audioStream={videoMedia.getAudioTrack()}
            videoContainerRef={videoContainerRef}
            scrollingContainerRef={rightVideoControlsRef}
            containerRef={subContainerRef}
          />
          <FgSettingsButton
            fgVideoOptions={fgVideoOptions}
            videoEffectsActive={videoEffectsActive}
            videoContainerRef={videoContainerRef}
            settingsActive={settingsActive}
            setSettingsActive={setSettingsActive}
            activePages={activePages}
            setActivePages={setActivePages}
            settings={settings}
            setSettings={setSettings}
            scrollingContainerRef={rightVideoControlsRef}
          />
          <VideoEffectsButton
            fgLowerVideoController={fgLowerVideoController}
            videoEffectsActive={videoEffectsActive}
            settingsActive={settingsActive}
            scrollingContainerRef={rightVideoControlsRef}
          />
          <AudioEffectsButton
            table_id={table_id.current}
            username={username.current}
            instance={instance.current}
            isUser={false}
            permissions={undefined}
            producerType={"video"}
            producerId={videoId}
            audioEffectsActive={audioEffectsActive}
            setAudioEffectsActive={setAudioEffectsActive}
            visualMediaContainerRef={videoContainerRef}
            handleAudioEffectChange={handleAudioEffectChange}
            handleMute={handleMute}
            videoContentMute={videoContentMute}
            closeLabelElement={
              <FgHoverContentStandard content='Close (x)' style='dark' />
            }
            hoverLabelElement={
              <FgHoverContentStandard
                content='Audio effects (a)'
                style='dark'
              />
            }
            scrollingContainerRef={rightVideoControlsRef}
            style={{ transform: "scaleX(-1)" }}
            options={{
              backgroundColor: "rgba(10, 10, 10, 1)",
              secondaryBackgroundColor: "rgba(35, 35, 35, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
