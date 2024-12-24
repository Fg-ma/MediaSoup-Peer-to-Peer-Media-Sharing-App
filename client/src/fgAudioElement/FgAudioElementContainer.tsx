import React, { Suspense, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useMediaContext } from "../context/mediaContext/MediaContext";
import { Permissions } from "../context/permissionsContext/typeConstant";
import { AudioEffectTypes } from "../context/effectsContext/typeConstant";
import FgAudioElement from "./FgAudioElement";
import FgContentAdjustmentController from "../fgAdjustmentComponents/lib/FgContentAdjustmentControls";
import PanButton from "../fgAdjustmentComponents/PanButton";
import RotateButton from "../fgAdjustmentComponents/RotateButton";
import ScaleButton from "../fgAdjustmentComponents/ScaleButton";
import FgAudioElementContainerController from "./lib/FgAudioElementContainerController";
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
  table_id,
  activeUsername,
  activeInstance,
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
  permissions,
  options,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  activeUsername: string | undefined;
  activeInstance: string | undefined;
  username: string;
  instance: string;
  name?: string;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  bundleRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes
  ) => void;
  handleMute: () => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser: boolean;
  permissions: Permissions;
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

  const { userDataStreams, remoteDataStreams } = useMediaContext();

  const [popupVisible, setPopupVisible] = useState(false);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);
  const audioElementSVGRef = useRef<SVGSVGElement>(null);

  const [_rerender, setRerender] = useState(false);
  const [adjustingDimensions, setAdjustingDimensions] = useState(false);
  const [inAudioContainer, setInAudioContainer] = useState(false);

  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 37.5, top: 37.5 },
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

  const fgAudioElementContainerController =
    new FgAudioElementContainerController(
      isUser,
      table_id,
      username,
      instance,
      positioning,
      permissions,
      remoteDataStreams,
      positioningListeners,
      setRerender
    );

  useEffect(() => {
    // Listen for messages on socket
    socket.current.on(
      "message",
      fgAudioElementContainerController.handleMessage
    );

    // Request initial catch up data
    if (!isUser && activeUsername && activeInstance) {
      const msg = {
        type: "requestCatchUpData",
        header: {
          table_id: table_id,
          inquiringUsername: activeUsername,
          inquiringInstance: activeInstance,
          inquiredUsername: username,
          inquiredInstance: instance,
          inquiredType: "audio",
        },
      };
      socket.current.send(msg);
    }

    return () => {
      socket.current.off(
        "message",
        fgAudioElementContainerController.handleMessage
      );
    };
  }, []);

  useEffect(() => {
    // Ensure remoteDataStreams and necessary permissions are valid
    if (
      !remoteDataStreams.current ||
      (isUser && !permissions.acceptsAudioEffects)
    ) {
      return;
    }

    fgAudioElementContainerController.attachListeners();

    // Cleanup on unmount or dependency change
    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
    };
  }, []);

  useEffect(() => {
    if (
      adjustingDimensions &&
      (isUser || permissions.acceptsAudioEffects) &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id,
          username,
          instance,
          type: "audio",
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  return (
    <div
      id={`${username}_${instance}_audio_element_container`}
      className={`audio-element-container ${
        adjustingDimensions ? "adjusting-dimensions" : ""
      } ${inAudioContainer ? "in-audio-container" : ""}`}
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
      data-positioning={JSON.stringify(positioning.current)}
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
        doubleClickFunction={
          isUser || permissions.acceptsAudioEffects
            ? () => {
                setAudioEffectsSectionVisible((prev) => !prev);
              }
            : undefined
        }
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
      {(isUser || permissions.acceptsAudioEffects) &&
        audioEffectsSectionVisible && (
          <Suspense fallback={<div>Loading...</div>}>
            <AudioEffectsSection
              socket={socket}
              table_id={table_id}
              username={username}
              instance={instance}
              isUser={isUser}
              permissions={permissions}
              producerType={"audio"}
              producerId={undefined}
              handleAudioEffectChange={handleAudioEffectChange}
              placement='right'
              referenceElement={
                audioElementSVGRef as unknown as React.RefObject<HTMLElement>
              }
              padding={12}
              handleMute={handleMute}
              localMute={localMute}
              clientMute={clientMute}
              closeCallback={() => setAudioEffectsSectionVisible(false)}
            />
          </Suspense>
        )}
    </div>
  );
}
