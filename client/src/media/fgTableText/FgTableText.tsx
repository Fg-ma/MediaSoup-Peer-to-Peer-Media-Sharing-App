import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import LowerTextController from "./lib/lowerTextControls/LowerTextController";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import DownloadButton from "./lib/lowerTextControls/downloadButton/DownloadButton";
import TextController from "./lib/TextController";
import SettingsButton from "./lib/lowerTextControls/settingsButton/SettingsButton";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import ExpandLineNumbers from "./lib/ExpandLineNumbers";
import MonacoTextArea from "./lib/monaco/MonacoTextArea";
import CornersDecorator from "../../elements/decorators/CornersDecorator";
import "./lib/fgTextStyles.css";

export default function FgTableText({
  textInstanceId,
  bundleRef,
  tableRef,
}: {
  textInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const textMediaInstance =
    userMedia.current.text.tableInstances[textInstanceId];

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

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isLineNums, setIsLineNums] = useState(true);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const lowerTextController = useRef(
    new LowerTextController(
      textMediaInstance,
      textContainerRef,
      setSettings,
      setSettingsActive,
      setIsReadOnly,
      textAreaContainerRef,
    ),
  );

  const textController = useRef(
    new TextController(setSettingsActive, textMediaInstance, text, setRerender),
  );

  useEffect(() => {
    if (textMediaInstance.instanceText) {
      text.current = textMediaInstance.instanceText;
      setRerender((prev) => !prev);
    }
    textMediaInstance.textMedia.addTextListener(
      textController.current.handleTextMessages,
    );

    document.addEventListener(
      "keydown",
      lowerTextController.current.handleKeyDown,
    );

    tableRef.current?.addEventListener(
      "scroll",
      textController.current.handleTableScroll,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerTextController.current.handleKeyDown,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        textController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    if (isReadOnly) return;

    document.addEventListener(
      "pointerdown",
      lowerTextController.current.handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        lowerTextController.current.handlePointerDown,
      );
    };
  }, [isReadOnly]);

  return (
    <FgMediaContainer
      filename={textMediaInstance.textMedia.filename}
      pauseDownload={textMediaInstance.textMedia.downloader?.pause}
      resumeDownload={textMediaInstance.textMedia.downloader?.resume}
      retryDownload={textMediaInstance.textMedia.retryDownload}
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
      setPositioning={textMediaInstance.setPositioning}
      mediaId={textMediaInstance.textMedia.textId}
      mediaInstanceId={textInstanceId}
      kind="text"
      initState={textMediaInstance.textMedia.state}
      media={
        <MonacoTextArea
          initialText={text.current}
          settings={settings}
          isLineNums={isLineNums}
          setIsLineNums={setIsLineNums}
          isReadOnly={isReadOnly}
          setIsReadOnly={setIsReadOnly}
          textMediaInstance={textMediaInstance}
          externalTextAreaContainerRef={textAreaContainerRef}
        />
      }
      floatingContent={[
        <ExpandLineNumbers
          isLineNums={isLineNums}
          setIsLineNums={setIsLineNums}
        />,
        !isReadOnly ? (
          <CornersDecorator className="z-[100] stroke-fg-red-light" width={4} />
        ) : null,
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
          isReadOnly={isReadOnly}
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
