import React, { useEffect, useRef, useState } from "react";
import { motion, Transition, Variants } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
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
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";
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
  mediaId,
  mediaInstanceId,
  filename,
  kind,
  initState,
  bundleRef,
  backgroundMedia,
  media,
  floatingTagContent,
  rootMedia,
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
  mediaId: string;
  mediaInstanceId: string;
  filename: string;
  kind: StaticContentTypes;
  initState: ContentStateTypes[];
  bundleRef: React.RefObject<HTMLDivElement>;
  backgroundMedia: boolean;
  media?: React.ReactNode;
  floatingTagContent?: React.ReactNode[];
  rootMedia?: HTMLImageElement | HTMLVideoElement | SVGSVGElement;
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
  const { table_id } = useUserInfoContext();

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

  const [state, setState] = useState<ContentStateTypes[]>(initState);

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

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender,
  );

  const lowerController = new LowerController(
    tableStaticContentSocket,
    mediaId,
    mediaInstanceId,
    filename,
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
    setState,
  );

  const mediaContainerController = new MediaContainerController(
    table_id,
    mediaId,
    mediaInstanceId,
    kind,
    rootMedia,
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
  );

  useEffect(() => {
    setState(initState);
  }, [initState]);

  useEffect(() => {
    mediaContainerController.attachPositioningListeners();
  }, [JSON.stringify(remoteDataStreams.current)]);

  useEffect(() => {
    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      mediaContainerController.handleMediasoupMessage,
    );
    tableSocket.current?.addMessageListener(
      mediaContainerController.handleTableMessage,
    );

    document.addEventListener("keydown", lowerController.handleKeyDown);

    rootMedia?.addEventListener(
      "load",
      mediaContainerController.handleMetadataLoaded,
    );

    rootMedia?.addEventListener(
      "loadedmetadata",
      mediaContainerController.handleMetadataLoaded,
    );

    document.addEventListener(
      "fullscreenchange",
      lowerController.handleFullScreenChange,
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        mediaContainerController.handleMediasoupMessage,
      );
      tableSocket.current?.removeMessageListener(
        mediaContainerController.handleTableMessage,
      );
      document.removeEventListener("keydown", lowerController.handleKeyDown);
      rootMedia?.removeEventListener(
        "load",
        mediaContainerController.handleMetadataLoaded,
      );
      rootMedia?.removeEventListener(
        "loadedmetadata",
        mediaContainerController.handleMetadataLoaded,
      );
      document.removeEventListener(
        "fullscreenchange",
        lowerController.handleFullScreenChange,
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
          table_id: table_id.current,
          kind,
          mediaId,
          mediaInstanceId,
          positioning: positioning.current,
        }),
      );
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
      } ${className} absolute flex items-center justify-center`}
      style={
        backgroundMedia
          ? {
              left: "0%",
              top: "0%",
              width: "100%",
              height: "100%",
              rotate: "0deg",
              zIndex: 0,
            }
          : {
              left: `${positioning.current.position.left}%`,
              top: `${positioning.current.position.top}%`,
              width: `${positioning.current.scale.x}%`,
              height: `${positioning.current.scale.y}%`,
              rotate: `${positioning.current.rotation}deg`,
              transformOrigin: "0% 0%",
              zIndex: 10,
            }
      }
      onPointerEnter={mediaContainerController.handlePointerEnter}
      onPointerLeave={mediaContainerController.handlePointerLeave}
      data-positioning={JSON.stringify(positioning.current)}
      variants={MediaContainerVar}
      initial="init"
      animate="animate"
      exit="init"
      transition={MediaContainerTransition}
    >
      {floatingTagContent &&
        floatingTagContent.map((item, index) => (
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
        className="sub-media-container pointer-events-none absolute flex h-full w-full items-center justify-center overflow-hidden rounded-md font-K2D text-white"
      >
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
