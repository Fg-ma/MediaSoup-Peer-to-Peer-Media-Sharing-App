import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import LowerTextController from "./lib/lowerTextControls/LowerTextController";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import DownloadButton from "./lib/lowerTextControls/downloadButton/DownloadButton";
import TextController from "./lib/TextController";
import SettingsButton from "./lib/lowerTextControls/settingsButton/SettingsButton";
import { ActivePages, defaultActiveSettingsPages } from "./lib/typeConstant";
import ExpandLineNumbers from "./lib/ExpandLineNumbers";
import Monaco from "./lib/monaco/Monaco";
import CornersDecorator from "../../elements/decorators/CornersDecorator";
import SaveSection from "./lib/lowerTextControls/saveSection/SaveSection";
import TinyLoader from "../../elements/loaders/tinyLoader/TinyLoader";
import HoverElement from "../../elements/hoverElement/HoverElement";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import "./lib/fgTextStyles.css";

export default function FgTableText({
  textInstanceId,
  bundleRef,
  tableRef,
  tableTopRef,
}: {
  textInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  tableTopRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { staticContentMedia } = useMediaContext();
  const { sendGroupSignal } = useSignalContext();

  const textMediaInstance =
    staticContentMedia.current.text.tableInstances[textInstanceId];

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(textMediaInstance.initPositioning);

  const textContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerTextControlsRef = useRef<HTMLDivElement>(null);

  const [settingsActive, setSettingsActive] = useState(false);
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages,
  );

  const initializing = useRef(false);
  const forceFinishInitialization = useRef(false);
  const [isLineNums, setIsLineNums] = useState(true);
  const textAreaContainerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const lowerTextController = useRef(
    new LowerTextController(
      textMediaInstance,
      tableTopRef,
      textContainerRef,
      setSettingsActive,
      textAreaContainerRef,
      setRerender,
      initializing,
      forceFinishInitialization,
      tableStaticContentSocket,
      sendGroupSignal,
    ),
  );

  const textController = useRef(
    new TextController(
      textMediaInstance,
      staticContentEffectsStyles,
      setSettingsActive,
      setRerender,
    ),
  );

  useEffect(() => {
    textMediaInstance.textMedia.addTextListener(
      textController.current.handleTextMessages,
    );

    textMediaInstance.addTextInstanceListener(
      textController.current.handleTextInstanceMessage,
    );

    tableStaticContentSocket.current?.addMessageListener(
      textController.current.handleTableStaticContentMessage,
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
      textMediaInstance.textMedia.removeTextListener(
        textController.current.handleTextMessages,
      );
      textMediaInstance.removeTextInstanceListener(
        textController.current.handleTextInstanceMessage,
      );
      tableStaticContentSocket.current?.removeMessageListener(
        textController.current.handleTableStaticContentMessage,
      );
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
    if (textMediaInstance.isReadOnly) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      return;
    }

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
  }, [textMediaInstance.isReadOnly]);

  return (
    <FgMediaContainer
      filename={textMediaInstance.textMedia.filename}
      pauseDownload={textMediaInstance.textMedia.liveTextDownloader?.pause}
      resumeDownload={textMediaInstance.textMedia.liveTextDownloader?.resume}
      retryDownload={textMediaInstance.textMedia.retryDownload}
      downloadingState={textMediaInstance.textMedia.loadingState}
      addDownloadListener={
        textMediaInstance.textMedia.loadingState !== "downloaded"
          ? textMediaInstance.textMedia.addTextListener
          : undefined
      }
      removeDownloadListener={
        textMediaInstance.textMedia.loadingState !== "downloaded"
          ? textMediaInstance.textMedia.removeTextListener
          : undefined
      }
      setPositioning={textMediaInstance.setPositioning}
      mediaId={textMediaInstance.textMedia.textId}
      mediaInstanceId={textInstanceId}
      kind="text"
      initState={textMediaInstance.textMedia.state}
      media={
        textMediaInstance.textMedia.loadingState === "downloaded" && (
          <Monaco
            isLineNums={isLineNums}
            setIsLineNums={setIsLineNums}
            externalInitializing={initializing}
            externalRerender={setRerender}
            textMediaInstance={textMediaInstance}
            externalTextAreaContainerRef={textAreaContainerRef}
            forceFinishInitialization={forceFinishInitialization}
          />
        )
      }
      floatingContent={[
        <ExpandLineNumbers
          isLineNums={isLineNums}
          setIsLineNums={setIsLineNums}
        />,
        !textMediaInstance.isReadOnly ? (
          <CornersDecorator className="z-[100] stroke-fg-red-light" width={4} />
        ) : null,
      ]}
      bundleRef={bundleRef}
      backgroundMedia={textMediaInstance.settings.background.value}
      className="text-container"
      rightLowerControls={[
        <SettingsButton
          textMediaInstance={textMediaInstance}
          containerRef={textContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          scrollingContainerRef={rightLowerTextControlsRef}
          lowerTextController={lowerTextController}
          setRerender={setRerender}
        />,
        textMediaInstance.textMedia.loadingState === "downloaded" && (
          <DownloadButton
            settingsActive={settingsActive}
            lowerTextController={lowerTextController}
            scrollingContainerRef={rightLowerTextControlsRef}
          />
        ),
      ]}
      leftLowerControls={[
        initializing.current ? (
          <HoverElement
            className="aspect-square h-full"
            content={
              <TinyLoader
                className={`${forceFinishInitialization.current ? "rotate-90" : ""} h-full w-full cursor-pointer`}
                onClick={
                  lowerTextController.current.handleForceFinishInitialization
                }
              />
            }
            hoverContent={
              <FgHoverContentStandard
                style="light"
                content={"Initializing... (ctrl+I) [Caution can cause lag!]"}
              />
            }
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverTimeoutDuration: 750,
            }}
          />
        ) : (
          <SaveSection
            settingsActive={settingsActive}
            lowerTextController={lowerTextController}
            scrollingContainerRef={rightLowerTextControlsRef}
            textMediaInstance={textMediaInstance}
          />
        ),
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
