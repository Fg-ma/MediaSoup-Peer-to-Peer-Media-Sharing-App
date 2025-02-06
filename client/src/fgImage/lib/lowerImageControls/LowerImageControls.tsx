import React, { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../../context/userInfoContext/UserInfoContext";
import { AudioEffectTypes } from "../../../context/effectsContext/typeConstant";
import { IncomingMediasoupMessages } from "../../../lib/MediasoupSocketController";
import LowerImageController from "./lib/LowerImageController";
import { ImageOptions, Settings } from "../typeConstant";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FullScreenButton from "./lib/fullScreenButton/FullScreenButton";
import ImageEffectsButton from "./lib/imageEffectsButton/ImageEffectsButton";
import AudioEffectsButton from "../../../audioEffectsButton/AudioEffectsButton";
import ImageMedia from "../../../lib/ImageMedia";

const ImageEffectsSection = React.lazy(
  () => import("../imageEffectsSection/ImageEffectsSection")
);

export default function LowerImageControls({
  imageId,
  imageMedia,
  lowerImageController,
  pausedState,
  imageContainerRef,
  subContainerRef,
  imageEffectsActive,
  imageOptions,
}: {
  imageId: string;
  imageMedia: ImageMedia;
  lowerImageController: LowerImageController;
  pausedState: boolean;
  imageContainerRef: React.RefObject<HTMLDivElement>;
  subContainerRef: React.RefObject<HTMLDivElement>;
  imageEffectsActive: boolean;
  imageOptions: ImageOptions;
}) {
  const { mediasoupSocket } = useSocketContext();
  const { table_id, username, instance } = useUserInfoContext();

  const [_, setRerender] = useState(false);
  const rightImageControlsRef = useRef<HTMLDivElement>(null);

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
      <div className='flex video-controls w-full h-10 justify-between'>
        <div
          className='flex w-max h-10 z-20 items-center space-x-2'
          style={{ boxShadow: "20px 0 15px -12px rgba(0, 0, 0, 0.9)" }}
        ></div>
        <div
          ref={rightImageControlsRef}
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
