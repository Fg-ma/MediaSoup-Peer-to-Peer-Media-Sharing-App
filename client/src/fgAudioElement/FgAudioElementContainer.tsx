import React, { Suspense, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AudioEffectTypes } from "../context/streamsContext/typeConstant";
import FgAudioElement from "./FgAudioElement";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import PanButton from "../fgAdjustmentComponents/PanButton";
import RotateButton from "../fgAdjustmentComponents/RotateButton";
import ScaleButton from "../fgAdjustmentComponents/ScaleButton";
import "./lib/audioElement.css";

const FgPortal = React.lazy(() => import("../fgElements/fgPortal/FgPortal"));
const AudioEffectsSection = React.lazy(
  () => import("../audioEffectsButton/lib/AudioEffectsSection")
);

export type FgAudioElementContainerOptionsType = {
  controlsVanishTime: number;
  springDuration: number;
  noiseThreshold: number;
  numFixedPoints: number;
  bellCurveAmplitude: number;
  bellCurveMean: number;
  bellCurveStdDev: number;
  shadowColor: string;
  volumeColor: string;
  primaryMuteColor: string;
  secondaryMuteColor: string;
  muteStyleOption: "morse" | "smile";
};

const defaultFgAudioElementContainerOptions: FgAudioElementContainerOptionsType =
  {
    controlsVanishTime: 1250,
    springDuration: 250,
    noiseThreshold: 0.2,
    numFixedPoints: 10,
    bellCurveAmplitude: 1,
    bellCurveMean: 0.5,
    bellCurveStdDev: 0.4,
    shadowColor: "black",
    volumeColor: "FgPrimary",
    primaryMuteColor: "FgPrimary",
    secondaryMuteColor: "black",
    muteStyleOption: "smile",
  };

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
    controlsVanishTime?: number;
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
  const fgAudioElementContainerOptions = {
    ...defaultFgAudioElementContainerOptions,
    ...options,
  };

  const [popupVisible, setPopupVisible] = useState(false);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);
  const audioElementSVGRef = useRef<SVGSVGElement>(null);

  const [_rerender, setRerender] = useState(false);
  const [adjustingDimensions, setAdjustingDimensions] = useState(false);
  const [inAudioContainer, setInAudioContainer] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 50, top: 50 },
    scale: { x: 25, y: 25 },
    rotation: 0,
  });

  const leaveAudioContainerTimer = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    bundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  return (
    <div
      className={`audio-element-container ${
        adjustingDimensions ? "adjusting-dimensions" : ""
      } ${
        inAudioContainer ? "in-audio-container" : ""
      } bg-fg-primary bg-opacity-30`}
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
      onMouseEnter={() => {
        setInAudioContainer(true);
        if (leaveAudioContainerTimer.current) {
          clearTimeout(leaveAudioContainerTimer.current);
          leaveAudioContainerTimer.current = undefined;
        }
      }}
      onMouseLeave={() => {
        leaveAudioContainerTimer.current = setTimeout(() => {
          setInAudioContainer(false);
          clearTimeout(leaveAudioContainerTimer.current);
          leaveAudioContainerTimer.current = undefined;
        }, fgAudioElementContainerOptions.controlsVanishTime);
      }}
    >
      <PanButton
        className={
          "pan-btn min-w-7 w-[5.5%] aspect-square absolute top-1/2 -translate-y-1/2 -left-3" // disapeaing button
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.movementDragFunction(
            displacement,
            {
              x: 0,
              y: -(pixelScale.y / 2),
            },
            {
              x:
                (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                  bundleRef.current.clientHeight +
                pixelScale.y / 2,
            }
          );
        }}
        bundleRef={bundleRef}
        mouseDownFunction={() => {
          fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
            "position",
            { rotationPointPlacement: "middleLeft" }
          );
        }}
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
        }
      />
      <RotateButton
        className={
          "rotate-btn min-w-7 w-[5.5%] aspect-square absolute top-1/2 -translate-y-[150%] -right-1.5"
        }
        dragFunction={(_displacement, event) => {
          if (!bundleRef.current) {
            return;
          }

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          const box = bundleRef.current.getBoundingClientRect();

          fgContentAdjustmentController.rotateDragFunction(event, {
            x:
              (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth +
              box.left,
            y:
              (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight +
              box.top +
              pixelScale.y / 2,
          });
        }}
        bundleRef={bundleRef}
        mouseDownFunction={
          fgContentAdjustmentController.adjustmentBtnMouseDownFunction
        }
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
        }
      />
      <ScaleButton
        className={
          "scale-btn min-w-6 w-[5%] aspect-square absolute top-1/2 translate-y-1/2 -right-1.5"
        }
        dragFunction={(displacement) => {
          if (!bundleRef.current) {
            return;
          }

          const angle =
            2 * Math.PI - positioning.current.rotation * (Math.PI / 180);

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.scaleDragFunction(
            "square",
            {
              x: displacement.x + Math.sin(angle) * (pixelScale.x / 2),
              y: displacement.y + Math.cos(angle) * (pixelScale.y / 2),
            },
            {
              x:
                (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                bundleRef.current.clientHeight,
            },
            {
              x:
                (positioning.current.position.left / 100) *
                bundleRef.current.clientWidth,
              y:
                (positioning.current.position.top / 100) *
                  bundleRef.current.clientHeight +
                pixelScale.y / 2,
            }
          );
        }}
        bundleRef={bundleRef}
        mouseDownFunction={() => {
          if (!bundleRef.current) {
            return;
          }

          const pixelScale = {
            x:
              (positioning.current.scale.x / 100) *
              bundleRef.current.clientWidth,
            y:
              (positioning.current.scale.y / 100) *
              bundleRef.current.clientHeight,
          };

          fgContentAdjustmentController.adjustmentBtnMouseDownFunction(
            "scale",
            {
              aspect: "square",
              referencePoint: {
                x:
                  (positioning.current.position.left / 100) *
                  bundleRef.current.clientWidth,
                y:
                  (positioning.current.position.top / 100) *
                  bundleRef.current.clientHeight,
              },
              rotationPoint: {
                x:
                  (positioning.current.position.left / 100) *
                  bundleRef.current.clientWidth,
                y:
                  (positioning.current.position.top / 100) *
                    bundleRef.current.clientHeight +
                  pixelScale.y / 2,
              },
            }
          );
        }}
        mouseUpFunction={
          fgContentAdjustmentController.adjustmentBtnMouseUpFunction
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
        fgAudioElementContainerOptions={fgAudioElementContainerOptions}
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
  );
}
