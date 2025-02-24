import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import LowerTextController from "./lib/lowerTextControls/LowerTextController";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import DownloadButton from "./lib/lowerTextControls/downloadButton/DownloadButton";
import "./lib/fgTextStyles.css";
import TextController from "./lib/TextController";
import SettingsButton from "./lib/lowerTextControls/settingsButton/SettingsButton";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import EditableText from "./lib/EditableText";
import ExpandLineNumbers from "./lib/ExpandLineNumbers";

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

  const text = useRef("");

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages
  );

  const expandLineNumbersButtonRef = useRef<HTMLButtonElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const lowerTextController = new LowerTextController(
    textMedia,
    textContainerRef,
    shiftPressed,
    controlPressed
  );

  const textController = new TextController(
    setSettingsActive,
    setRerender,
    text,
    textMedia
  );

  useEffect(() => {
    document.addEventListener("keydown", lowerTextController.handleKeyDown);

    document.addEventListener("keyup", lowerTextController.handleKeyUp);

    textMedia.addListener(textController.handleTextMediaEvents);

    tableRef.current?.addEventListener(
      "scroll",
      textController.handleTableScroll
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerTextController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerTextController.handleKeyUp);
      textMedia.removeListener(textController.handleTextMediaEvents);
      tableRef.current?.removeEventListener(
        "scroll",
        textController.handleTableScroll
      );
    };
  }, []);

  return (
    <FgMediaContainer
      mediaId={textId}
      filename={textMedia.filename}
      kind='text'
      media={
        <EditableText
          text={text}
          settings={settings}
          expandLineNumbersButtonRef={expandLineNumbersButtonRef}
          lineNumbersRef={lineNumbersRef}
        />
      }
      floatingTagContent={[
        <ExpandLineNumbers
          expandLineNumbersButtonRef={expandLineNumbersButtonRef}
          lineNumbersRef={lineNumbersRef}
        />,
      ]}
      bundleRef={bundleRef}
      className='text-container'
      rightLowerControls={[
        <SettingsButton
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
          lowerTextController={lowerTextController}
          scrollingContainerRef={rightLowerTextControlsRef}
        />,
      ]}
      inMediaVariables={[settingsActive]}
      preventLowerLabelsVariables={[settingsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={textContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerTextControlsRef}
      options={{
        gradient: false,
        controlsPlacement: "outside",
        resizeType: "any",
      }}
    />
  );
}
