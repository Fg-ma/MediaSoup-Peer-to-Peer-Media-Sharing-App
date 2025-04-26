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
  textInstanceId,
  bundleRef,
  tableRef,
}: {
  textInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const textMediaInstance = userMedia.current.text.instances[textInstanceId];

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(textMediaInstance.initPositioning);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerTextControlsRef = useRef<HTMLDivElement>(null);

  const text = useRef("");

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages,
  );

  const [isEditing, setIsEditing] = useState(false);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLPreElement>(null);

  const expandLineNumbersButtonRef = useRef<HTMLButtonElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const lowerTextController = new LowerTextController(
    textMediaInstance,
    textContainerRef,
    setSettings,
    setSettingsActive,
    textAreaRef,
    setIsEditing,
    textAreaContainerRef,
  );

  const textController = new TextController(
    setSettingsActive,
    textMediaInstance,
    text,
    setRerender,
  );

  useEffect(() => {
    if (textMediaInstance.instanceText) {
      text.current = textMediaInstance.instanceText;
      setRerender((prev) => !prev);
    }
    textMediaInstance.textMedia.addTextListener(
      textController.handleTextMessages,
    );

    document.addEventListener("keydown", lowerTextController.handleKeyDown);

    tableRef.current?.addEventListener(
      "scroll",
      textController.handleTableScroll,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerTextController.handleKeyDown,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        textController.handleTableScroll,
      );
    };
  }, []);

  return (
    <FgMediaContainer
      downloadingState={textMediaInstance.textMedia.loadingState}
      addDownloadListener={
        textMediaInstance.textMedia.loadingState === "downloading"
          ? textMediaInstance.textMedia.addTextListener
          : undefined
      }
      removeDownloadListener={
        textMediaInstance.textMedia.loadingState === "downloading"
          ? textMediaInstance.textMedia.removeTextListener
          : undefined
      }
      mediaId={textMediaInstance.textMedia.textId}
      mediaInstanceId={textInstanceId}
      filename={textMediaInstance.textMedia.filename}
      kind="text"
      initState={textMediaInstance.textMedia.state}
      media={
        <EditableText
          lowerTextController={lowerTextController}
          text={text}
          settings={settings}
          expandLineNumbersButtonRef={expandLineNumbersButtonRef}
          lineNumbersRef={lineNumbersRef}
          textAreaRef={textAreaRef}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          textAreaContainerRef={textAreaContainerRef}
        />
      }
      floatingTagContent={[
        <ExpandLineNumbers
          expandLineNumbersButtonRef={expandLineNumbersButtonRef}
          lineNumbersRef={lineNumbersRef}
        />,
      ]}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value}
      className="text-container"
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
          lowerTextController={lowerTextController}
        />,
        <DownloadButton
          settingsActive={settingsActive}
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
