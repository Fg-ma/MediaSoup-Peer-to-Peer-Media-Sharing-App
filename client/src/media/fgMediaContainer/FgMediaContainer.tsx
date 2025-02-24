import React, { useEffect, useRef, useState } from "react";
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
import { TableContentTypes } from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import "./lib/mediaContainerStyles.css";

const AdjustmentButtons = React.lazy(() => import("./lib/AdjustmentButtons"));

export default function FgMediaContainer({
  mediaId,
  filename,
  kind,
  bundleRef,
  media,
  floatingTagContent,
  rootMedia,
  className,
  lowerPopupElements,
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
  kind: TableContentTypes;
  bundleRef: React.RefObject<HTMLDivElement>;
  media?: React.ReactNode;
  floatingTagContent?: React.ReactNode[];
  rootMedia?: HTMLImageElement | HTMLVideoElement;
  className?: string;
  lowerPopupElements?: (React.ReactNode | null)[];
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
  const { mediasoupSocket, tableStaticContentSocket } = useSocketContext();
  const { table_id } = useUserInfoContext();

  const mediaContainerRef =
    externalMediaContainerRef ?? useRef<HTMLDivElement>(null);
  const subContainerRef =
    externalSubContainerRef ?? useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);

  const [inMedia, setInMedia] = useState(false);
  const [fullscreen, setFullScreen] = useState(false);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [adjustingDimensions, setAdjustingDimensions] = useState(false);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_rerender, setRerender] = useState(false);

  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});

  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

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
    setFullScreen,
    mediaContainerOptions,
    setDesync,
    setReactionsPanelActive
  );

  const mediaContainerController = new MediaContainerController(
    table_id,
    mediaId,
    kind,
    rootMedia,
    positioningListeners,
    setAspectRatio,
    positioning,
    remoteDataStreams,
    mediaContainerRef,
    mediaContainerOptions,
    setInMedia,
    leaveTimer,
    movementTimeout,
    setRerender,
    tableStaticContentSocket
  );

  useEffect(() => {
    mediaContainerController.attachPositioningListeners();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      mediaContainerController.handleMediasoupMessage
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
    <div
      ref={mediaContainerRef}
      id={`${mediaId}_media_container`}
      className={`media-container ${
        inMedia || inMediaVariables?.some(Boolean) ? "in-media" : ""
      } ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } ${
        fullscreen ? "full-screen" : ""
      } ${className} flex items-center justify-center`}
      style={{
        position: "absolute",
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${positioning.current.scale.x}%`,
        height: `${positioning.current.scale.y}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      onPointerEnter={() => mediaContainerController.handlePointerEnter()}
      onPointerLeave={() => mediaContainerController.handlePointerLeave()}
      data-positioning={JSON.stringify(positioning.current)}
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
      {adjustingDimensions && (
        <>
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      {mediaContainerOptions.controlsPlacement === "outside" && !fullscreen && (
        <>
          <UpperControls
            desync={desync}
            reactionsPanelActive={reactionsPanelActive}
            lowerController={lowerController}
            leftUpperControls={leftUpperControls}
            rightUpperControls={rightUpperControls}
            mediaContainerOptions={mediaContainerOptions}
            fullscreen={fullscreen}
          />
          <LowerControls
            lowerController={lowerController}
            externalRightLowerControlsRef={externalRightLowerControlsRef}
            leftLowerControls={leftLowerControls}
            rightLowerControls={rightLowerControls}
            lowerPopupElements={lowerPopupElements}
            mediaContainerOptions={mediaContainerOptions}
            preventLowerLabelsVariables={preventLowerLabelsVariables}
            fullscreen={fullscreen}
          />
        </>
      )}
      <div
        ref={subContainerRef}
        className='flex sub-media-container relative items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden bg-black'
      >
        {media && media}
        {(mediaContainerOptions.controlsPlacement === "inside" ||
          fullscreen) && (
          <>
            <UpperControls
              desync={desync}
              reactionsPanelActive={reactionsPanelActive}
              lowerController={lowerController}
              leftUpperControls={leftUpperControls}
              rightUpperControls={rightUpperControls}
              mediaContainerOptions={mediaContainerOptions}
              fullscreen={fullscreen}
            />
            <LowerControls
              lowerController={lowerController}
              externalRightLowerControlsRef={externalRightLowerControlsRef}
              leftLowerControls={leftLowerControls}
              rightLowerControls={rightLowerControls}
              lowerPopupElements={lowerPopupElements}
              mediaContainerOptions={mediaContainerOptions}
              preventLowerLabelsVariables={preventLowerLabelsVariables}
              fullscreen={fullscreen}
            />
          </>
        )}
        {(mediaContainerOptions.gradient || fullscreen) && <Gradient />}
      </div>
    </div>
  );
}
