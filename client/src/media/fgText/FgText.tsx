import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import LowerTextController from "./lib/lowerTextControls/LowerTextController";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import FullScreenButton from "./lib/lowerTextControls/fullScreenButton/FullScreenButton";
import DownloadButton from "./lib/lowerTextControls/downloadButton/DownloadButton";
import "./lib/fgTextStyles.css";
import TextController from "./lib/TextController";
import SettingsButton from "./lib/lowerTextControls/settingsButton/SettingsButton";

export default function FgText({
  textId,
  bundleRef,
  tableRef,
}: {
  textId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const textMedia = userMedia.current.text[textId];

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(textMedia.initPositioning);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerTextControlsRef = useRef<HTMLDivElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [rerender, setRerender] = useState(false);

  const lowerTextController = new LowerTextController(
    textMedia,
    textContainerRef,
    shiftPressed,
    controlPressed
  );

  const textController = new TextController(setRerender);

  useEffect(() => {
    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerTextController.handleFullScreenChange
    );

    document.addEventListener("keydown", lowerTextController.handleKeyDown);

    document.addEventListener("keyup", lowerTextController.handleKeyUp);

    textMedia.addListener(textController.handleTextMediaEvents);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        lowerTextController.handleFullScreenChange
      );
      document.removeEventListener(
        "keydown",
        lowerTextController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerTextController.handleKeyUp);

      textMedia.removeListener(textController.handleTextMediaEvents);
    };
  }, []);

  return (
    <FgMediaContainer
      mediaId={textId}
      filename={textMedia.filename}
      kind='text'
      media={
        <pre className='w-full h-full overflow-auto px-4 pt-3 small-multidirectional-scroll-bar bg-fg-tone-black-1 text-fg-white'>
          {textMedia.text &&
            textMedia.text.split("\n").map((line, index) => (
              <div key={index}>
                <span className='text-[#22c55e]'>[{index + 1}]</span> {line}
              </div>
            ))}
        </pre>
      }
      bundleRef={bundleRef}
      className='text-container'
      rightLowerControls={[
        <FullScreenButton
          lowerTextController={lowerTextController}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
        <SettingsButton
          settingsPanelRef={}
          settingsButtonRef={}
          activePages={}
          setActivePages={}
          settings={}
          setSettings={}
        />,
        <DownloadButton
          lowerTextController={lowerTextController}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
      ]}
      externalPositioning={positioning}
      externalMediaContainerRef={textContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerTextControlsRef}
      options={{ gradient: false, controlsPlacement: "outside" }}
    />
  );
}
