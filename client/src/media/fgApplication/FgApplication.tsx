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
  applicationInstanceId,
  bundleRef,
  tableRef,
  options,
}: {
  applicationInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: ApplicationOptions;
}) {
  const applicationOptions = {
    ...defaultApplicationOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const applicationMedia =
    userMedia.current.application.instances[applicationInstanceId];

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
    userEffectsStyles.current.application[applicationInstanceId].tint.color
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
    applicationInstanceId,
    applicationMedia,
    applicationContainerRef,
    shiftPressed,
    controlPressed,
    setApplicationEffectsActive,
    tintColor,
    userEffects,
    userEffectsStyles,
    setSettingsActive,
    settings,
    recording,
    downloadRecordingReady,
    setRerender,
    tableStaticContentSocket,
    setSettings
  );

  const applicationController = new ApplicationController(
    applicationContainerRef,
    applicationOptions,
    setSettingsActive
  );

  useEffect(() => {
    if (applicationMedia.instanceCanvas) {
      subContainerRef.current?.appendChild(applicationMedia.instanceCanvas);
    }
    applicationMedia.addDownloadCompleteListener(() => {
      if (applicationMedia.instanceCanvas) {
        const allCanvas = subContainerRef.current?.querySelectorAll("canvas");

        if (allCanvas) {
          allCanvas.forEach((canvasElement) => {
            canvasElement.remove();
          });
        }

        subContainerRef.current?.appendChild(applicationMedia.instanceCanvas);
      }
    });

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
      mediaId={applicationMedia.applicationId}
      mediaInstanceId={applicationInstanceId}
      filename={applicationMedia.filename}
      kind='application'
      rootMedia={applicationMedia.instanceApplication}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value === "true"}
      className='application-container'
      popupElements={[
        applicationEffectsActive ? (
          <ApplicationEffectsSection
            applicationInstanceId={applicationInstanceId}
            lowerApplicationController={lowerApplicationController}
            tintColor={tintColor}
            applicationMedia={applicationMedia}
            applicationContainerRef={applicationContainerRef}
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
          lowerApplicationController={lowerApplicationController}
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
