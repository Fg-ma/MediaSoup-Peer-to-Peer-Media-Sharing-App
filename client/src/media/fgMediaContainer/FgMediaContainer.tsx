import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import LowerControls from "./lib/lowerControls/LowerControls";
import MediaContainerController from "./lib/MediaContainerController";
import LowerController from "./lib/lowerControls/lib/LowerController";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import {
  defaultMediaContainerOptions,
  MediaContainerOptions,
} from "./lib/typeConstant";
import Gradient from "./lib/Gradient";
import UpperControls from "./lib/upperControls/UpperControls";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";
import DownloadFailed from "../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../elements/downloadPaused/DownloadPaused";
import LoadingElement from "../../elements/loadingElement/LoadingElement";
import "./lib/mediaContainerStyles.css";

const AdjustmentButtons = React.lazy(() => import("./lib/AdjustmentButtons"));

const MediaContainerVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const MediaContainerTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
  },
};

export default function FgMediaContainer({
  filename,
  pauseDownload,
  resumeDownload,
  retryDownload,
  downloadingState,
  addDownloadListener,
  removeDownloadListener,
  getAspect,
  setPositioning,
  mediaId,
  mediaInstanceId,
  kind,
  initState,
  bundleRef,
  backgroundMedia,
  media,
  floatingContent,
  className,
  popupElements,
  leftLowerControls,
  rightLowerControls,
  leftUpperControls,
  rightUpperControls,
  inMediaVariables,
  preventLowerLabelsVariables,
  externalPositioning,
  externalMediaContainerRef,
  externalSubContainerRef,
  externalRightLowerControlsRef,
  options,
}: {
  filename?: string;
  pauseDownload?: () => void;
  resumeDownload?: () => void;
  retryDownload?: () => void;
  downloadingState: "downloading" | "downloaded" | "failed" | "paused";
  addDownloadListener?: (
    listener: (
      message: { type: "downloadComplete" } | { type: string },
    ) => void,
  ) => void;
  removeDownloadListener?: (
    listener: (
      message: { type: "downloadComplete" } | { type: string },
    ) => void,
  ) => void;
  getAspect?: () => number | undefined;
  setPositioning?: (positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }) => void;
  mediaId: string;
  mediaInstanceId: string;
  kind: StaticContentTypes;
  initState: TableContentStateTypes[];
  bundleRef: React.RefObject<HTMLDivElement>;
  backgroundMedia: boolean;
  media?: React.ReactNode;
  floatingContent?: React.ReactNode[];
  className?: string;
  popupElements?: (React.ReactNode | null)[];
  leftLowerControls?: (React.ReactNode | null)[];
  rightLowerControls?: (React.ReactNode | null)[];
  leftUpperControls?: (React.ReactNode | null)[];
  rightUpperControls?: (React.ReactNode | null)[];
  inMediaVariables?: boolean[];
  preventLowerLabelsVariables?: boolean[];
  externalPositioning?: React.MutableRefObject<{
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }>;
  externalMediaContainerRef?: React.RefObject<HTMLDivElement>;
  externalSubContainerRef?: React.RefObject<HTMLDivElement>;
  externalRightLowerControlsRef?: React.RefObject<HTMLDivElement>;
  options?: MediaContainerOptions;
}) {
  const mediaContainerOptions = {
    ...defaultMediaContainerOptions,
    ...options,
  };

  const { userDataStreams, remoteDataStreams } = useMediaContext();
  const { mediasoupSocket, tableStaticContentSocket, tableSocket } =
    useSocketContext();
  const { tableId } = useUserInfoContext();
  const {
    sendGroupSignal,
    addGroupSignalListener,
    removeGroupSignalListener,
    addMediaPositioningSignalListener,
    removeMediaPositioningSignalListener,
  } = useSignalContext();

  const mediaContainerRef =
    externalMediaContainerRef ?? useRef<HTMLDivElement>(null);
  const subContainerRef =
    externalSubContainerRef ?? useRef<HTMLDivElement>(null);
  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const [inMedia, setInMedia] = useState(false);
  const [fullscreen, setFullScreen] = useState(false);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const state = useRef<TableContentStateTypes[]>(initState);

  const [_, setRerender] = useState(false);

  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});

  const aspectRatio = useRef<number | undefined>(undefined);

  const positioning =
    externalPositioning ??
    useRef<{
      position: { left: number; top: number };
      scale: { x: number; y: number };
      rotation: number;
    }>({
      position: { left: 32.5, top: 32.5 },
      scale: { x: 35, y: 35 },
      rotation: 0,
    });

  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);

  const fgContentAdjustmentController = useRef<FgContentAdjustmentController>(
    new FgContentAdjustmentController(
      bundleRef,
      positioning,
      setAdjustingDimensions,
      setRerender,
    ),
  );

  const lowerController = useRef(
    new LowerController(
      tableStaticContentSocket,
      mediaId,
      mediaInstanceId,
      kind,
      bundleRef,
      mediaContainerRef,
      panBtnRef,
      fgContentAdjustmentController,
      positioning,
      aspectRatio,
      setFullScreen,
      mediaContainerOptions,
      setReactionsPanelActive,
      behindEffectsContainerRef,
      frontEffectsContainerRef,
      tableSocket,
      state,
      setRerender,
    ),
  );

  const mediaContainerController = useRef(
    new MediaContainerController(
      tableId,
      mediaId,
      mediaInstanceId,
      kind,
      getAspect,
      setPositioning,
      positioningListeners,
      aspectRatio,
      positioning,
      remoteDataStreams,
      mediaContainerRef,
      mediaContainerOptions,
      setInMedia,
      leaveTimer,
      movementTimeout,
      setRerender,
      tableStaticContentSocket,
      lowerController,
      fgContentAdjustmentController,
      bundleRef,
      sendGroupSignal,
      adjustingDimensions,
      userDataStreams,
    ),
  );

  useEffect(() => {
    state.current = initState;
    setRerender((prev) => !prev);
  }, [initState]);

  useEffect(() => {
    mediaContainerController.current.attachPositioningListeners();
  }, [JSON.stringify(remoteDataStreams.current)]);

  useEffect(() => {
    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      mediaContainerController.current.handleMediasoupMessage,
    );
    tableSocket.current?.addMessageListener(
      mediaContainerController.current.handleTableMessage,
    );
    addGroupSignalListener(mediaContainerController.current.handleGroupSignal);
    addMediaPositioningSignalListener(
      mediaContainerController.current.handleMediaPositioningSignal,
    );

    document.addEventListener("keydown", lowerController.current.handleKeyDown);

    if (downloadingState !== "downloaded") {
      if (addDownloadListener)
        addDownloadListener(mediaContainerController.current.downloadListener);
    } else {
      if (getAspect) {
        aspectRatio.current = getAspect();
      }
    }

    document.addEventListener(
      "fullscreenchange",
      lowerController.current.handleFullScreenChange,
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        mediaContainerController.current.handleMediasoupMessage,
      );
      tableSocket.current?.removeMessageListener(
        mediaContainerController.current.handleTableMessage,
      );
      removeGroupSignalListener(
        mediaContainerController.current.handleGroupSignal,
      );
      removeMediaPositioningSignalListener(
        mediaContainerController.current.handleMediaPositioningSignal,
      );
      document.removeEventListener(
        "keydown",
        lowerController.current.handleKeyDown,
      );
      if (downloadingState !== "downloaded") {
        if (removeDownloadListener)
          removeDownloadListener(
            mediaContainerController.current.downloadListener,
          );
      }
      document.removeEventListener(
        "fullscreenchange",
        lowerController.current.handleFullScreenChange,
      );
    };
  }, []);

  useEffect(() => {
    if (
      adjustingDimensions &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          tableId: tableId.current,
          kind,
          mediaId,
          mediaInstanceId,
          positioning: positioning.current,
        }),
      );
      if (setPositioning) setPositioning(positioning.current);
    }
  }, [positioning.current]);

  return (
    <motion.div
      ref={mediaContainerRef}
      id={`${mediaInstanceId}_media_container`}
      className={`media-container ${
        inMedia || reactionsPanelActive || inMediaVariables?.some(Boolean)
          ? "in-media"
          : ""
      } ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } ${
        fullscreen ? "full-screen" : ""
      } ${backgroundMedia ? "z-background-content" : "z-base-content"} ${className} absolute flex items-center justify-center`}
      style={
        backgroundMedia
          ? {
              left: "0%",
              top: "0%",
              width: "100%",
              height: "100%",
              rotate: "0deg",
            }
          : {
              left: `${positioning.current.position.left}%`,
              top: `${positioning.current.position.top}%`,
              width: `${positioning.current.scale.x}%`,
              height: `${positioning.current.scale.y}%`,
              rotate: `${positioning.current.rotation}deg`,
              transformOrigin: "0% 0%",
            }
      }
      onPointerEnter={mediaContainerController.current.handlePointerEnter}
      onPointerLeave={mediaContainerController.current.handlePointerLeave}
      data-positioning={JSON.stringify(positioning.current)}
      variants={MediaContainerVar}
      initial="init"
      animate="animate"
      exit="init"
      transition={MediaContainerTransition}
    >
      {floatingContent &&
        floatingContent.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      <AdjustmentButtons
        kind={kind}
        mediaId={mediaId}
        mediaInstanceId={mediaInstanceId}
        bundleRef={bundleRef}
        panBtnRef={panBtnRef}
        positioning={positioning}
        fgContentAdjustmentController={fgContentAdjustmentController}
        tableStaticContentSocket={tableStaticContentSocket}
        aspectRatio={aspectRatio}
        mediaContainerOptions={mediaContainerOptions}
      />
      {mediaContainerOptions.adjustmentAnimation && adjustingDimensions && (
        <>
          <div className="animated-border-box-glow"></div>
          <div className="animated-border-box"></div>
        </>
      )}
      {mediaContainerOptions.controlsPlacement === "outside" &&
        !fullscreen &&
        !backgroundMedia && (
          <>
            <UpperControls
              filename={filename}
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
              lowerController={lowerController}
              leftUpperControls={leftUpperControls}
              rightUpperControls={rightUpperControls}
              mediaContainerOptions={mediaContainerOptions}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
              state={state}
            />
            <LowerControls
              lowerController={lowerController}
              externalRightLowerControlsRef={externalRightLowerControlsRef}
              leftLowerControls={leftLowerControls}
              rightLowerControls={rightLowerControls}
              mediaContainerOptions={mediaContainerOptions}
              preventLowerLabelsVariables={preventLowerLabelsVariables}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
            />
          </>
        )}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={frontEffectsContainerRef}
          className="pointer-events-none relative z-[100] h-full w-full"
        />
      </div>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={behindEffectsContainerRef}
          className="pointer-events-none relative -z-[100] h-full w-full"
        />
      </div>
      <div
        ref={subContainerRef}
        className="selectable sub-media-container pointer-events-none absolute flex h-full w-full items-center justify-center overflow-hidden rounded-md font-K2D text-white"
        data-selectable-type={kind}
        data-selectable-id={mediaInstanceId}
      >
        <AnimatePresence>
          {downloadingState === "downloading" && (
            <motion.div
              key="loading-element"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto absolute left-0 top-0 z-[100] h-full w-full"
            >
              <LoadingElement
                className="h-full w-full"
                pauseDownload={pauseDownload}
                aspectRatio={aspectRatio}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {downloadingState === "failed" && (
          <DownloadFailed
            className="pointer-events-auto absolute left-0 top-0 z-[100] h-full w-full"
            onClick={retryDownload}
          />
        )}
        {downloadingState === "paused" && (
          <DownloadPaused
            className="pointer-events-auto absolute left-0 top-0 z-[100] h-full w-full"
            onClick={resumeDownload}
          />
        )}
        {media && media}
        <div className="media-lower-controls !pointer-events-none absolute left-0 top-0 h-full w-full">
          {popupElements &&
            popupElements.length > 0 &&
            popupElements.map((element, index) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
        </div>
        {(mediaContainerOptions.controlsPlacement === "inside" ||
          fullscreen ||
          backgroundMedia) && (
          <>
            <UpperControls
              filename={filename}
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
              lowerController={lowerController}
              leftUpperControls={leftUpperControls}
              rightUpperControls={rightUpperControls}
              mediaContainerOptions={mediaContainerOptions}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
              state={state}
            />
            <LowerControls
              lowerController={lowerController}
              externalRightLowerControlsRef={externalRightLowerControlsRef}
              leftLowerControls={leftLowerControls}
              rightLowerControls={rightLowerControls}
              mediaContainerOptions={mediaContainerOptions}
              preventLowerLabelsVariables={preventLowerLabelsVariables}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
            />
          </>
        )}
        {(mediaContainerOptions.gradient || fullscreen) && <Gradient />}
      </div>
    </motion.div>
  );
}
