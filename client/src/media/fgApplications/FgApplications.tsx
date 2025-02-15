import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import ApplicationsController from "./lib/ApplicationsController";
import LowerApplicationsController from "./lib/lowerApplicationsControls/LowerApplicationsController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultApplicationsOptions,
  defaultSettings,
  ApplicationsOptions,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../../fgMediaContainer/FgMediaContainer";
import FullScreenButton from "./lib/lowerApplicationsControls/fullScreenButton/FullScreenButton";
import ApplicationsEffectsButton from "./lib/lowerApplicationsControls/applicationsEffectsButton/ApplicationsEffectsButton";
import ApplicationsEffectsSection from "./lib/applicationsEffectsSection/ApplicationsEffectsSection";
import "./lib/fgApplicationsStyles.css";
import DownloadButton from "./lib/lowerApplicationsControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerApplicationsControls/settingsButton/SettingsButton";
import DownloadRecordingButton from "./lib/lowerApplicationsControls/downloadButton/DownloadRecordingButton";

export default function FgApplications({
  applicationsId,
  bundleRef,
  tableRef,
  options,
}: {
  applicationsId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: ApplicationsOptions;
}) {
  const applicationsOptions = {
    ...defaultApplicationsOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const applicationsMedia = userMedia.current.applications[applicationsId];

  const [applicationsEffectsActive, setApplicationsEffectsActive] =
    useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });

  const applicationsContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerApplicationsControlsRef = useRef<HTMLDivElement>(null);

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

  const lowerApplicationsController = new LowerApplicationsController(
    applicationsId,
    applicationsMedia,
    applicationsContainerRef,
    shiftPressed,
    controlPressed,
    setApplicationsEffectsActive,
    tintColor,
    userStreamEffects,
    userMedia,
    setSettingsActive,
    settings,
    recording,
    downloadRecordingReady,
    setRerender
  );

  const applicationsController = new ApplicationsController(
    tableStaticContentSocket,
    applicationsId,
    applicationsMedia,
    positioning,
    applicationsContainerRef,
    subContainerRef,
    applicationsOptions,
    setRerender,
    setSettingsActive
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(applicationsMedia.canvas);

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "applications",
      applicationsId
    );

    // Set up initial conditions
    applicationsController.init();

    // Listen for messages on tableStaticContentSocket
    tableStaticContentSocket.current?.addMessageListener(
      applicationsController.handleTableStaticContentMessage
    );

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerApplicationsController.handleFullScreenChange
    );

    document.addEventListener(
      "keydown",
      lowerApplicationsController.handleKeyDown
    );

    document.addEventListener("keyup", lowerApplicationsController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      applicationsController.handleTableScroll
    );

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        applicationsController.handleTableStaticContentMessage
      );
      document.removeEventListener(
        "fullscreenchange",
        lowerApplicationsController.handleFullScreenChange
      );
      document.removeEventListener(
        "keydown",
        lowerApplicationsController.handleKeyDown
      );
      document.removeEventListener(
        "keyup",
        lowerApplicationsController.handleKeyUp
      );
      tableRef.current?.removeEventListener(
        "scroll",
        applicationsController.handleTableScroll
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      applicationsMedia.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  return (
    <FgMediaContainer
      mediaId={applicationsId}
      filename={applicationsMedia.filename}
      kind='applications'
      rootMedia={applicationsMedia.applications}
      bundleRef={bundleRef}
      className='applications-container'
      lowerPopupElements={[
        applicationsEffectsActive ? (
          <ApplicationsEffectsSection
            applicationsId={applicationsId}
            lowerApplicationsController={lowerApplicationsController}
            tintColor={tintColor}
            applicationsMedia={applicationsMedia}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <FullScreenButton
          lowerApplicationsController={lowerApplicationsController}
          applicationsEffectsActive={applicationsEffectsActive}
          scrollingContainerRef={rightLowerApplicationsControlsRef}
        />,
        <SettingsButton
          effectsActive={applicationsEffectsActive}
          containerRef={applicationsContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightLowerApplicationsControlsRef}
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerApplicationsController={lowerApplicationsController}
          applicationsEffectsActive={applicationsEffectsActive}
          scrollingContainerRef={rightLowerApplicationsControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerApplicationsController={lowerApplicationsController}
            applicationsEffectsActive={applicationsEffectsActive}
            scrollingContainerRef={rightLowerApplicationsControlsRef}
          />
        ) : null,
        <ApplicationsEffectsButton
          lowerApplicationsController={lowerApplicationsController}
          applicationsEffectsActive={applicationsEffectsActive}
          scrollingContainerRef={rightLowerApplicationsControlsRef}
        />,
      ]}
      inMediaVariables={[applicationsEffectsActive, settingsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={applicationsContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerApplicationsControlsRef}
    />
  );
}
