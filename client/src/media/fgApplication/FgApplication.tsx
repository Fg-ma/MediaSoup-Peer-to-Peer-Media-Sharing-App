import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import ApplicationController from "./lib/ApplicationController";
import LowerApplicationController from "./lib/lowerApplicationControls/LowerApplicationController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultApplicationOptions,
  defaultSettings,
  ApplicationOptions,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import ApplicationEffectsButton from "./lib/lowerApplicationControls/applicationEffectsButton/ApplicationEffectsButton";
import ApplicationEffectsSection from "./lib/applicationEffectsSection/ApplicationEffectsSection";
import DownloadButton from "./lib/lowerApplicationControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerApplicationControls/settingsButton/SettingsButton";
import DownloadRecordingButton from "./lib/lowerApplicationControls/downloadButton/DownloadRecordingButton";
import "./lib/fgApplicationStyles.css";

export default function FgApplication({
  applicationId,
  bundleRef,
  tableRef,
  options,
}: {
  applicationId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: ApplicationOptions;
}) {
  const applicationOptions = {
    ...defaultApplicationOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userStreamEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const applicationMedia = userMedia.current.application[applicationId];

  const [applicationEffectsActive, setApplicationEffectsActive] =
    useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(applicationMedia.initPositioning);

  const applicationContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerApplicationControlsRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(
    userEffectsStyles.current.application[applicationId].tint.color
  );

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

  const lowerApplicationController = new LowerApplicationController(
    applicationId,
    applicationMedia,
    applicationContainerRef,
    shiftPressed,
    controlPressed,
    setApplicationEffectsActive,
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

  const applicationController = new ApplicationController(
    applicationContainerRef,
    applicationOptions,
    setSettingsActive
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(applicationMedia.canvas);

    // Set up initial conditions
    applicationController.init();

    document.addEventListener(
      "keydown",
      lowerApplicationController.handleKeyDown
    );

    document.addEventListener("keyup", lowerApplicationController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      applicationController.handleTableScroll
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerApplicationController.handleKeyDown
      );
      document.removeEventListener(
        "keyup",
        lowerApplicationController.handleKeyUp
      );
      tableRef.current?.removeEventListener(
        "scroll",
        applicationController.handleTableScroll
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      applicationMedia.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  return (
    <FgMediaContainer
      mediaId={applicationId}
      filename={applicationMedia.filename}
      kind='application'
      rootMedia={applicationMedia.application}
      bundleRef={bundleRef}
      className='application-container'
      lowerPopupElements={[
        applicationEffectsActive ? (
          <ApplicationEffectsSection
            applicationId={applicationId}
            lowerApplicationController={lowerApplicationController}
            tintColor={tintColor}
            applicationMedia={applicationMedia}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <SettingsButton
          effectsActive={applicationEffectsActive}
          containerRef={applicationContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightLowerApplicationControlsRef}
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerApplicationController={lowerApplicationController}
          applicationEffectsActive={applicationEffectsActive}
          scrollingContainerRef={rightLowerApplicationControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerApplicationController={lowerApplicationController}
            applicationEffectsActive={applicationEffectsActive}
            scrollingContainerRef={rightLowerApplicationControlsRef}
          />
        ) : null,
        <ApplicationEffectsButton
          lowerApplicationController={lowerApplicationController}
          applicationEffectsActive={applicationEffectsActive}
          scrollingContainerRef={rightLowerApplicationControlsRef}
        />,
      ]}
      inMediaVariables={[applicationEffectsActive, settingsActive]}
      preventLowerLabelsVariables={[settingsActive, applicationEffectsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={applicationContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerApplicationControlsRef}
    />
  );
}
