import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import ImageController from "./lib/ImageController";
import LowerImageController from "./lib/lowerImageControls/LowerImageController";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultImageOptions,
  defaultSettings,
  ImageOptions,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../../fgMediaContainer/FgMediaContainer";
import FullScreenButton from "./lib/lowerImageControls/fullScreenButton/FullScreenButton";
import ImageEffectsButton from "./lib/lowerImageControls/imageEffectsButton/ImageEffectsButton";
import ImageEffectsSection from "./lib/imageEffectsSection/ImageEffectsSection";
import "./lib/fgImageStyles.css";
import DownloadButton from "./lib/lowerImageControls/downloadButton/DownloadButton";
import SettingsButton from "./lib/lowerImageControls/settingsButton/SettingsButton";
import DownloadRecordingButton from "./lib/lowerImageControls/downloadButton/DownloadRecordingButton";

export default function FgImage({
  imageId,
  bundleRef,
  tableRef,
  options,
}: {
  imageId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
  options?: ImageOptions;
}) {
  const imageOptions = {
    ...defaultImageOptions,
    ...options,
  };

  const { userMedia } = useMediaContext();
  const { userStreamEffects } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const imageMedia = userMedia.current.image[imageId];

  const [imageEffectsActive, setImageEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerImageControlsRef = useRef<HTMLDivElement>(null);

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

  const lowerImageController = new LowerImageController(
    imageId,
    imageMedia,
    imageContainerRef,
    shiftPressed,
    controlPressed,
    setImageEffectsActive,
    tintColor,
    userStreamEffects,
    userMedia,
    setSettingsActive,
    settings,
    recording,
    downloadRecordingReady,
    setRerender
  );

  const imageController = new ImageController(
    tableStaticContentSocket,
    imageId,
    imageMedia,
    positioning,
    imageContainerRef,
    subContainerRef,
    imageOptions,
    setRerender,
    setSettingsActive
  );

  useEffect(() => {
    subContainerRef.current?.appendChild(imageMedia.canvas);

    tableStaticContentSocket.current?.requestCatchUpContentData(
      "image",
      imageId
    );

    // Set up initial conditions
    imageController.init();

    // Listen for messages on tableStaticContentSocket
    tableStaticContentSocket.current?.addMessageListener(
      imageController.handleTableStaticContentMessage
    );

    // Add eventlisteners
    document.addEventListener(
      "fullscreenchange",
      lowerImageController.handleFullScreenChange
    );

    document.addEventListener("keydown", lowerImageController.handleKeyDown);

    document.addEventListener("keyup", lowerImageController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      imageController.handleTableScroll
    );

    return () => {
      tableStaticContentSocket.current?.removeMessageListener(
        imageController.handleTableStaticContentMessage
      );
      document.removeEventListener(
        "fullscreenchange",
        lowerImageController.handleFullScreenChange
      );
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

  return (
    <FgMediaContainer
      mediaId={imageId}
      filename={imageMedia.filename}
      kind='image'
      rootMedia={imageMedia.image}
      bundleRef={bundleRef}
      className='image-container'
      lowerPopupElements={[
        imageEffectsActive ? (
          <ImageEffectsSection
            imageId={imageId}
            lowerImageController={lowerImageController}
            tintColor={tintColor}
            imageMedia={imageMedia}
          />
        ) : null,
      ]}
      leftLowerControls={[]}
      rightLowerControls={[
        <FullScreenButton
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
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
        />,
        <DownloadButton
          settings={settings}
          recording={recording}
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
        settings.downloadType.value === "record" &&
        downloadRecordingReady.current ? (
          <DownloadRecordingButton
            lowerImageController={lowerImageController}
            imageEffectsActive={imageEffectsActive}
            scrollingContainerRef={rightLowerImageControlsRef}
          />
        ) : null,
        <ImageEffectsButton
          lowerImageController={lowerImageController}
          imageEffectsActive={imageEffectsActive}
          scrollingContainerRef={rightLowerImageControlsRef}
        />,
      ]}
      inMediaVariables={[imageEffectsActive, settingsActive]}
      externalPositioning={positioning}
      externalMediaContainerRef={imageContainerRef}
      externalSubContainerRef={subContainerRef}
      externalRightLowerControlsRef={rightLowerImageControlsRef}
    />
  );
}
