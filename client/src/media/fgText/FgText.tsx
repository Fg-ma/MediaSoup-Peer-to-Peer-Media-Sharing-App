import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import TextController from "./lib/TextController";
import LowerTextController from "./lib/lowerTextControls/LowerTextController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultTextOptions,
  defaultSettings,
  TextOptions,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import FullScreenButton from "./lib/lowerTextControls/fullScreenButton/FullScreenButton";
import TextEffectsButton from "./lib/lowerTextControls/textEffectsButton/TextEffectsButton";
import TextEffectsSection from "./lib/textEffectsSection/TextEffectsSection";
import DownloadButton from "./lib/lowerTextControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerTextControls/settingsButton/SettingsButton";
import DownloadRecordingButton from "./lib/lowerTextControls/downloadButton/DownloadRecordingButton";
import "./lib/fgTextStyles.css";

export default function FgText({
  textId,
  bundleRef,
  tableRef,
  options,
}: {
  textId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: TextOptions;
}) {
  const textOptions = {
    ...defaultTextOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userStreamEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const textMedia = userMedia.current.text[textId];

  const [textEffectsActive, setTextEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });

  const textContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerTextControlsRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef("#F56114");

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_rerender, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages
  );

  const recording = useRef(false);
  const downloadRecordingReady = useRef(false);

  const lowerTextController = new LowerTextController(
    textId,
    textMedia,
    textContainerRef,
    shiftPressed,
    controlPressed,
    setTextEffectsActive,
    tintColor,
    userStreamEffects,
    userEffectsStyles,
    userMedia,
    setSettingsActive,
    settings,
    recording,
    downloadRecordingReady,
    setRerender,
    tableStaticContentSocket
  );

  const textController = new TextController(
    textContainerRef,
    textOptions,
    setSettingsActive
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(textMedia.canvas);

    // Set up initial conditions
    textController.init();

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerTextController.handleFullScreenChange
    );

    document.addEventListener("keydown", lowerTextController.handleKeyDown);

    document.addEventListener("keyup", lowerTextController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      textController.handleTableScroll
    );

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
      tableRef.current?.removeEventListener(
        "scroll",
        textController.handleTableScroll
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      textMedia.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  return (
    <FgMediaContainer
      mediaId={textId}
      filename={textMedia.filename}
      kind='text'
      rootMedia={textMedia.text}
      bundleRef={bundleRef}
      className='text-container'
      lowerPopupElements={[
        textEffectsActive ? (
          <TextEffectsSection
            textId={textId}
            lowerTextController={lowerTextController}
            tintColor={tintColor}
            textMedia={textMedia}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <FullScreenButton
          lowerTextController={lowerTextController}
          textEffectsActive={textEffectsActive}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
        <SettingsButton
          effectsActive={textEffectsActive}
          containerRef={textContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerTextController={lowerTextController}
          textEffectsActive={textEffectsActive}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerTextController={lowerTextController}
            textEffectsActive={textEffectsActive}
            scrollingContainerRef={rightLowerTextControlsRef}
          />
        ) : null,
        <TextEffectsButton
          lowerTextController={lowerTextController}
          textEffectsActive={textEffectsActive}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
      ]}
      inMediaVariables={[textEffectsActive, settingsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={textContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerTextControlsRef}
    />
  );
}
