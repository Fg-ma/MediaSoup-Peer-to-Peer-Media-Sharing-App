import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import SvgController from "./lib/SvgController";
import LowerSvgController from "./lib/lowerSvgControls/LowerSvgController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import SvgEffectsButton from "./lib/lowerSvgControls/svgEffectsButton/SvgEffectsButton";
import SvgEffectsSection from "./lib/svgEffectsSection/SvgEffectsSection";
import DownloadButton from "./lib/lowerSvgControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerSvgControls/settingsButton/SettingsButton";
import "./lib/fgSvgStyles.css";

export default function FgSvg({
  svgId,
  bundleRef,
  tableRef,
}: {
  svgId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { userStreamEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const svgMedia = userMedia.current.svg[svgId];

  const [svgEffectsActive, setSvgEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(svgMedia.initPositioning);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerSvgControlsRef = useRef<HTMLDivElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages
  );

  const lowerSvgController = new LowerSvgController(
    svgId,
    svgMedia,
    svgContainerRef,
    shiftPressed,
    controlPressed,
    setSvgEffectsActive,
    userStreamEffects,
    userEffectsStyles,
    userMedia,
    setSettingsActive,
    settings,
    setRerender,
    tableStaticContentSocket,
    setSettings
  );

  const svgController = new SvgController(
    svgId,
    svgMedia,
    setSettingsActive,
    userStreamEffects,
    userEffectsStyles,
    setRerender
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(imageMedia.canvas);

    document.addEventListener("keydown", lowerImageController.handleKeyDown);

    document.addEventListener("keyup", lowerImageController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      imageController.handleTableScroll
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerImageController.handleKeyDown
      );
      document.removeEventListener("keyup", lowerImageController.handleKeyUp);
      tableRef.current?.removeEventListener(
        "scroll",
        imageController.handleTableScroll
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      imageMedia.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      imageController.handleTableStaticContentMessage
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        imageController.handleTableStaticContentMessage
      );
  }, [tableStaticContentSocket.current]);

  return (
    <FgMediaContainer
      mediaId={imageId}
      filename={imageMedia.filename}
      kind='image'
      rootMedia={imageMedia.image}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value === "true"}
      className='image-container'
      popupElements={[
        imageEffectsActive ? (
          <ImageEffectsSection
            imageId={imageId}
            lowerImageController={lowerImageController}
            tintColor={tintColor}
            imageMedia={imageMedia}
            imageContainerRef={imageContainerRef}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <SettingsButton
          effectsActive={imageEffectsActive}
          containerRef={imageContainerRef}
          settingsActive={settingsActive}
          setSettingsActive={setSettingsActive}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          scrollingContainerRef={rightLowerImageControlsRef}
          lowerImageController={lowerImageController}
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          settingsActive={settingsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerImageController={lowerImageController}
            imageEffectsActive={imageEffectsActive}
            settingsActive={settingsActive}
            scrollingContainerRef={rightLowerImageControlsRef}
          />
        ) : null,
        <ImageEffectsButton
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          settingsActive={settingsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
      ]}
      inMediaVariables={[imageEffectsActive, settingsActive]}
      preventLowerLabelsVariables={[settingsActive, imageEffectsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={imageContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerImageControlsRef}
    />
  );
}
