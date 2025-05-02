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

  const applicationMediaInstance =
    userMedia.current.application.instances[applicationInstanceId];

  const [applicationEffectsActive, setApplicationEffectsActive] =
    useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(applicationMediaInstance.initPositioning);

  const applicationContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerApplicationControlsRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(
    userEffectsStyles.current.application[applicationInstanceId].tint.color,
  );

  const [_rerender, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages,
  );

  const recording = useRef(false);
  const downloadRecordingReady = useRef(false);

  const lowerApplicationController = useRef(
    new LowerApplicationController(
      applicationInstanceId,
      applicationMediaInstance,
      applicationContainerRef,
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
      setSettings,
    ),
  );

  const applicationController = useRef(
    new ApplicationController(
      applicationContainerRef,
      applicationOptions,
      setSettingsActive,
      applicationMediaInstance,
      subContainerRef,
      positioning,
      setRerender,
    ),
  );

  useEffect(() => {
    if (applicationMediaInstance.instanceCanvas) {
      subContainerRef.current?.appendChild(
        applicationMediaInstance.instanceCanvas,
      );
    }

    // Set up initial conditions
    applicationController.current.init();

    applicationMediaInstance.applicationMedia.addApplicationListener(
      applicationController.current.handleApplicationMessages,
    );

    document.addEventListener(
      "keydown",
      lowerApplicationController.current.handleKeyDown,
    );

    tableRef.current?.addEventListener(
      "scroll",
      applicationController.current.handleTableScroll,
    );

    return () => {
      applicationMediaInstance.applicationMedia.removeApplicationListener(
        applicationController.current.handleApplicationMessages,
      );
      document.removeEventListener(
        "keydown",
        lowerApplicationController.current.handleKeyDown,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        applicationController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      applicationMediaInstance.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  return (
    <FgMediaContainer
      downloadingState={applicationMediaInstance.applicationMedia.loadingState}
      addDownloadListener={
        applicationMediaInstance.applicationMedia.loadingState === "downloading"
          ? applicationMediaInstance.applicationMedia.addApplicationListener
          : undefined
      }
      removeDownloadListener={
        applicationMediaInstance.applicationMedia.loadingState === "downloading"
          ? applicationMediaInstance.applicationMedia.removeApplicationListener
          : undefined
      }
      getAspect={applicationMediaInstance.getAspect}
      mediaId={applicationMediaInstance.applicationMedia.applicationId}
      mediaInstanceId={applicationInstanceId}
      filename={applicationMediaInstance.applicationMedia.filename}
      kind="application"
      initState={applicationMediaInstance.applicationMedia.state}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value === "true"}
      className="application-container"
      popupElements={[
        applicationEffectsActive ? (
          <ApplicationEffectsSection
            applicationInstanceId={applicationInstanceId}
            lowerApplicationController={lowerApplicationController}
            tintColor={tintColor}
            applicationMediaInstance={applicationMediaInstance}
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
