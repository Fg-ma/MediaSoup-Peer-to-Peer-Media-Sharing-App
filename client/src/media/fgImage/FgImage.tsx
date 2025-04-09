import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import ImageController from "./lib/ImageController";
import LowerImageController from "./lib/lowerImageControls/LowerImageController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import ImageEffectsButton from "./lib/lowerImageControls/imageEffectsButton/ImageEffectsButton";
import ImageEffectsSection from "./lib/imageEffectsSection/ImageEffectsSection";
import DownloadButton from "./lib/lowerImageControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerImageControls/settingsButton/SettingsButton";
import DownloadRecordingButton from "./lib/lowerImageControls/downloadButton/DownloadRecordingButton";
import "./lib/fgImageStyles.css";

export default function FgImage({
  imageInstanceId,
  bundleRef,
  tableRef,
}: {
  imageInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const imageMediaInstance = userMedia.current.image.instances[imageInstanceId];

  const [imageEffectsActive, setImageEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(imageMediaInstance.initPositioning);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerImageControlsRef = useRef<HTMLDivElement>(null);

  const tintColor = useRef(
    userEffectsStyles.current.image[imageInstanceId].tint.color,
  );

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages,
  );

  const recording = useRef(false);
  const downloadRecordingReady = useRef(false);

  const lowerImageController = new LowerImageController(
    imageInstanceId,
    imageMediaInstance,
    imageContainerRef,
    shiftPressed,
    controlPressed,
    setImageEffectsActive,
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
  );

  const imageController = new ImageController(
    imageInstanceId,
    imageMediaInstance,
    setSettingsActive,
    userEffects,
    userEffectsStyles,
    tintColor,
    setRerender,
    subContainerRef,
    positioning,
  );

  useEffect(() => {
    if (imageMediaInstance.instanceCanvas) {
      subContainerRef.current?.appendChild(imageMediaInstance.instanceCanvas);

      positioning.current.scale = {
        x: imageMediaInstance.imageMedia.aspect
          ? positioning.current.scale.y * imageMediaInstance.imageMedia.aspect
          : positioning.current.scale.x,
        y: positioning.current.scale.y,
      };

      setRerender((prev) => !prev);
    }
    imageMediaInstance.imageMedia.addImageListener(
      imageController.handleImageMessages,
    );

    document.addEventListener("keydown", lowerImageController.handleKeyDown);

    document.addEventListener("keyup", lowerImageController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      imageController.handleTableScroll,
    );

    return () => {
      imageMediaInstance.imageMedia.removeImageListener(
        imageController.handleImageMessages,
      );
      document.removeEventListener(
        "keydown",
        lowerImageController.handleKeyDown,
      );
      document.removeEventListener("keyup", lowerImageController.handleKeyUp);
      tableRef.current?.removeEventListener(
        "scroll",
        imageController.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(defaultActiveSettingsPages);
  }, [settingsActive]);

  useEffect(() => {
    if (settings.downloadType.value !== "record" && recording.current) {
      imageMediaInstance.babylonScene?.stopRecording();
      downloadRecordingReady.current = true;
      recording.current = false;
    }
  }, [settings.downloadType.value]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      imageController.handleTableStaticContentMessage,
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        imageController.handleTableStaticContentMessage,
      );
  }, [tableStaticContentSocket.current]);

  return (
    <FgMediaContainer
      mediaId={imageMediaInstance.imageMedia.imageId}
      mediaInstanceId={imageInstanceId}
      filename={imageMediaInstance.imageMedia.filename}
      kind="image"
      initState={imageMediaInstance.imageMedia.state}
      rootMedia={imageMediaInstance.instanceImage}
      bundleRef={bundleRef}
      backgroundMedia={settings.background.value === "true"}
      className="image-container"
      popupElements={[
        imageEffectsActive ? (
          <ImageEffectsSection
            imageInstanceId={imageInstanceId}
            lowerImageController={lowerImageController}
            tintColor={tintColor}
            imageMediaInstance={imageMediaInstance}
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
