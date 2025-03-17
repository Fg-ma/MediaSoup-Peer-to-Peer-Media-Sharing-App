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
import { StaticContentTypes } from "../../../../universal/typeConstant";
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
  filename,
  kind,
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
  filename: string;
  kind: StaticContentTypes;
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

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

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

  const [desync, setDesync] = useState(false);

  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const lowerController = new LowerController(
    tableStaticContentSocket,
    mediaId,
    filename,
    kind,
    bundleRef,
    mediaContainerRef,
    panBtnRef,
    shiftPressed,
    controlPressed,
    fgContentAdjustmentController,
    positioning,
    aspectRatio,
    setFullScreen,
    mediaContainerOptions,
    setDesync,
    setReactionsPanelActive,
    behindEffectsContainerRef,
    frontEffectsContainerRef,
    tableSocket
  );

  const mediaContainerController = new MediaContainerController(
    table_id,
    mediaId,
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
    lowerController
  );

  useEffect(() => {
    mediaContainerController.attachPositioningListeners();
  }, [JSON.stringify(remoteDataStreams.current)]);

  useEffect(() => {
    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      mediaContainerController.handleMediasoupMessage
    );
    tableSocket.current?.addMessageListener(
      mediaContainerController.handleTableMessage
    );

    document.addEventListener("keydown", lowerController.handleKeyDown);

    document.addEventListener("keyup", lowerController.handleKeyUp);

    rootMedia?.addEventListener(
      "load",
      mediaContainerController.handleMetadataLoaded
    );

    rootMedia?.addEventListener(
      "loadedmetadata",
      mediaContainerController.handleMetadataLoaded
    );

    document.addEventListener(
      "fullscreenchange",
      lowerController.handleFullScreenChange
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      positioningListeners.current = {};
      mediasoupSocket.current?.removeMessageListener(
        mediaContainerController.handleMediasoupMessage
      );
      tableSocket.current?.removeMessageListener(
        mediaContainerController.handleTableMessage
      );
      document.removeEventListener("keydown", lowerController.handleKeyDown);
      document.removeEventListener("keyup", lowerController.handleKeyUp);
      rootMedia?.removeEventListener(
        "load",
        mediaContainerController.handleMetadataLoaded
      );
      rootMedia?.removeEventListener(
        "loadedmetadata",
        mediaContainerController.handleMetadataLoaded
      );
      document.removeEventListener(
        "fullscreenchange",
        lowerController.handleFullScreenChange
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
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  return (
    <motion.div
      ref={mediaContainerRef}
      id={`${mediaId}_media_container`}
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
      } ${className} flex items-center justify-center absolute`}
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
      initial='init'
      animate='animate'
      exit='init'
      transition={MediaContainerTransition}
    >
      {floatingTagContent &&
        floatingTagContent.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      <AdjustmentButtons
        kind={kind}
        mediaId={mediaId}
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
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      {mediaContainerOptions.controlsPlacement === "outside" &&
        !fullscreen &&
        !backgroundMedia && (
          <>
            <UpperControls
              desync={desync}
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
              lowerController={lowerController}
              leftUpperControls={leftUpperControls}
              rightUpperControls={rightUpperControls}
              mediaContainerOptions={mediaContainerOptions}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
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
      <div className='w-full h-full absolute top-0 left-0 pointer-events-none'>
        <div
          ref={frontEffectsContainerRef}
          className='w-full h-full relative z-[100] pointer-events-none'
        />
      </div>
      <div className='w-full h-full absolute top-0 left-0 pointer-events-none'>
        <div
          ref={behindEffectsContainerRef}
          className='w-full h-full relative -z-[100] pointer-events-none'
        />
      </div>
      <div
        ref={subContainerRef}
        className='flex sub-media-container absolute items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden'
      >
        {media && media}
        <div className='media-lower-controls pointer-events-none w-full h-full absolute top-0 left-0'>
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
              desync={desync}
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
              lowerController={lowerController}
              leftUpperControls={leftUpperControls}
              rightUpperControls={rightUpperControls}
              mediaContainerOptions={mediaContainerOptions}
              fullscreen={fullscreen}
              backgroundMedia={backgroundMedia}
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
