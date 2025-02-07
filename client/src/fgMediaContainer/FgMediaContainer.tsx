import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { useSocketContext } from "../context/socketContext/SocketContext";
import { useUserInfoContext } from "../context/userInfoContext/UserInfoContext";
import LowerControls from "./lib/lowerControls/LowerControls";
import MediaContainerController from "./lib/MediaContainerController";
import LowerController from "./lib/lowerControls/lib/LowerController";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import {
  defaultMediaContainerOptions,
  MediaContainerOptions,
  MediaKinds,
} from "./lib/typeConstant";
import Gradient from "./lib/Gradient";
import "./lib/mediaContainerStyles.css";
import UpperControls from "./lib/upperControls/UpperControls";

const AdjustmentButtons = React.lazy(() => import("./lib/AdjustmentButtons"));

export default function FgMediaContainer({
  mediaId,
  kind,
  bundleRef,
  media,
  externalPositioning,
  externalMediaContainerRef,
  externalSubContainerRef,
  options,
}: {
  mediaId: string;
  kind: MediaKinds;
  bundleRef: React.RefObject<HTMLDivElement>;
  media: React.ReactNode;
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

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const lowerController = new LowerController(
    tableStaticContentSocket,
    mediaId,
    kind,
    bundleRef,
    mediaContainerRef,
    panBtnRef,
    shiftPressed,
    controlPressed,
    fgContentAdjustmentController,
    positioning
  );

  const mediaContainerController = new MediaContainerController(
    table_id,
    mediaId,
    kind,
    positioningListeners,
    positioning,
    remoteDataStreams,
    mediaContainerRef,
    mediaContainerOptions,
    setInMedia,
    leaveTimer,
    movementTimeout,
    setRerender
  );

  useEffect(() => {
    mediaContainerController.attachPositioningListeners();

    // Set up initial conditions
    mediaContainerController.init();

    // Listen for messages on mediasoupSocket
    mediasoupSocket.current?.addMessageListener(
      mediaContainerController.handleMediasoupMessage
    );

    document.addEventListener("keydown", lowerController.handleKeyDown);

    document.addEventListener("keyup", lowerController.handleKeyUp);

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
      className={`media-container ${inMedia ? "in-media" : ""} ${
        adjustingDimensions
          ? "adjusting-dimensions pointer-events-none"
          : "pointer-events-auto"
      } flex items-center justify-center`}
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
      <AdjustmentButtons
        bundleRef={bundleRef}
        panBtnRef={panBtnRef}
        positioning={positioning}
        fgContentAdjustmentController={fgContentAdjustmentController}
      />
      {adjustingDimensions && (
        <>
          <div className='animated-border-box-glow'></div>
          <div className='animated-border-box'></div>
        </>
      )}
      <div
        ref={subContainerRef}
        className='flex relative items-center justify-center text-white font-K2D h-full w-full rounded-md overflow-hidden bg-black'
      >
        {media}
        <UpperControls desync={desync} lowerController={lowerController} />
        <LowerControls />
        <Gradient />
      </div>
    </div>
  );
}
