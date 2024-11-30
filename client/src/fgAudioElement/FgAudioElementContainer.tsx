import React, { Suspense, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../context/streamsContext/typeConstant";
import FgAudioElement from "./FgAudioElement";
import PanButton from "./lib/positionScaleRotation/PanButton";
import RotateButton from "./lib/positionScaleRotation/RotateButton";
import ScaleButton from "./lib/positionScaleRotation/ScaleButton";
import FgAdjustmentVideoController from "../fgVisualMedia/lib/FgAdjustmentVideoControls";

const FgPortal = React.lazy(() => import("../fgElements/fgPortal/FgPortal"));
const AudioEffectsSection = React.lazy(
  () => import("../audioEffectsButton/lib/AudioEffectsSection")
);

export default function FgAudioElementContainer({
  socket,
  username,
  instance,
  name,
  audioStream,
  audioRef,
  bundleRef,
  handleAudioEffectChange,
  handleMute,
  clientMute,
  localMute,
  isUser,
  options,
}: {
  socket: React.MutableRefObject<Socket>;
  username: string;
  instance: string;
  name?: string;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  bundleRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (effect: AudioEffectTypes) => void;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser: boolean;
  options?: {
    springDuration?: number;
    noiseThreshold?: number;
    numFixedPoints?: number;
    bellCurveAmplitude?: number;
    bellCurveMean?: number;
    bellCurveStdDev?: number;
    shadowColor?: string;
    volumeColor?: string;
    primaryMuteColor?: string;
    secondaryMuteColor?: string;
    muteStyleOption?: "morse" | "smile";
  };
}) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);
  const audioElementSVGRef = useRef<SVGSVGElement>(null);

  const [_rerender, setRerender] = useState(false);
  const [_adjustingDimensions, setAdjustingDimensions] = useState(false);
  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 50, top: 50 },
    scale: { x: 25, y: 25 },
    rotation: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fgAdjustmentAudioController = new FgAdjustmentVideoController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender,
    canvasRef
  );

  return (
    <>
      <canvas
        className='w-full h-full absolute top-0 left-0'
        ref={canvasRef}
      ></canvas>
      <div
        className='bg-fg-primary bg-opacity-30'
        style={{
          position: "relative",
          left: `${positioning.current.position.left}%`,
          top: `${positioning.current.position.top}%`,
          width: `${Math.max(
            positioning.current.scale.x,
            positioning.current.scale.y
          )}%`,
          height: `${Math.max(
            positioning.current.scale.x,
            positioning.current.scale.y
          )}%`,
          rotate: `${positioning.current.rotation}deg`,
          transformOrigin: "0% 50%",
        }}
      >
        <PanButton
          dragFunction={fgAdjustmentAudioController.movementDragFunction}
          bundleRef={bundleRef}
          positioning={positioning}
          mouseDownFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseDownFunction
          }
          mouseUpFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseUpFunction
          }
        />
        <RotateButton
          dragFunction={fgAdjustmentAudioController.rotateDragFunction}
          bundleRef={bundleRef}
          positioning={positioning}
          mouseDownFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseDownFunction
          }
          mouseUpFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseUpFunction
          }
        />
        <ScaleButton
          dragFunction={fgAdjustmentAudioController.scaleDragFunction}
          bundleRef={bundleRef}
          positioning={positioning}
          mouseDownFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseDownFunction
          }
          mouseUpFunction={
            fgAdjustmentAudioController.adjustmentBtnMouseUpFunction
          }
        />
        <FgAudioElement
          svgRef={audioElementSVGRef}
          audioStream={audioStream}
          audioRef={audioRef}
          username={username}
          setPopupVisible={setPopupVisible}
          handleMute={handleMute}
          clientMute={clientMute}
          localMute={localMute}
          isUser={isUser}
          doubleClickFunction={() => {
            setAudioEffectsSectionVisible((prev) => !prev);
          }}
          options={options}
        />
        {popupVisible && (
          <Suspense fallback={<div>Loading...</div>}>
            <FgPortal
              type='mouse'
              content={
                <div className='w-max h-max shadow-lg px-4 py-2 rounded-md text-lg font-Josefin relative z-[50] bg-white'>
                  {name ? name : username}
                </div>
              }
            />
          </Suspense>
        )}
        {audioEffectsSectionVisible && (
          <Suspense fallback={<div>Loading...</div>}>
            <AudioEffectsSection
              socket={socket}
              username={username}
              instance={instance}
              isUser={isUser}
              handleAudioEffectChange={handleAudioEffectChange}
              placement='right'
              referenceElement={
                audioElementSVGRef as unknown as React.RefObject<HTMLElement>
              }
              padding={12}
              handleMute={handleMute}
              muteStateRef={localMute}
              closeCallback={() => setAudioEffectsSectionVisible(false)}
            />
          </Suspense>
        )}
      </div>
    </>
  );
}
