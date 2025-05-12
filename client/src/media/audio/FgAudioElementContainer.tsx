import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { Permissions } from "../../context/permissionsContext/lib/typeConstant";
import { useToolsContext } from "../../context/toolsContext/ToolsContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { AudioEffectTypes } from "../../../../universal/effectsTypeConstant";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgAudioElement from "./FgAudioElement";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import PanButton from "../../elements/fgAdjustmentElements/PanButton";
import RotateButton from "../../elements/fgAdjustmentElements/RotateButton";
import ScaleButton from "../../elements/fgAdjustmentElements/ScaleButton";
import FgAudioElementContainerController from "./lib/FgAudioElementContainerController";
import { TableColors } from "../../serverControllers/tableServer/lib/typeConstant";
import ReactButton from "../../elements/reactButton/ReactButton";
import {
  ActivePages,
  defaultActiveSettingsPages,
  defaultFgAudioElementContainerOptions,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import SettingsButton from "./lib/settingsButton/SettingsButton";
import Bezier from "../../elements/bezier/Bezier";
import "./lib/audioElement.css";

const FgPortal = React.lazy(() => import("../../elements/fgPortal/FgPortal"));
const AudioEffectsSection = React.lazy(
  () => import("../../audioEffectsButton/lib/AudioEffectsSection"),
);

export default function FgAudioElementContainer({
  tableId,
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
  handleDisableEnableBtns,
  isAudio,
  setAudioActive,
  options,
}: {
  tableId: string;
  username: string;
  instance: string;
  name?: string;
  audioStream?: MediaStream;
  audioRef: React.RefObject<HTMLAudioElement>;
  bundleRef: React.RefObject<HTMLDivElement>;
  handleAudioEffectChange: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
    effect: AudioEffectTypes,
  ) => void;
  handleMute: (
    producerType: "audio" | "screenAudio",
    producerId: string | undefined,
  ) => void;
  clientMute: React.MutableRefObject<boolean>;
  localMute: React.MutableRefObject<boolean>;
  isUser: boolean;
  permissions: Permissions;
  handleDisableEnableBtns: (disabled: boolean) => void;
  isAudio: React.MutableRefObject<boolean>;
  setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  options?: {
    controlsVanishTime?: number;
    springDuration?: number;
    noiseThreshold?: number;
    numFixedPoints?: number;
    bellCurveAmplitude?: number;
    bellCurveMean?: number;
    bellCurveStdDev?: number;
    shadowColor?: TableColors;
    volumeColor?: TableColors;
    primaryMuteColor?: TableColors;
    secondaryMuteColor?: TableColors;
    muteStyleOption?: "morse" | "smile";
  };
}) {
  const fgAudioElementContainerOptions = {
    ...defaultFgAudioElementContainerOptions,
    ...options,
  };

  const { userDataStreams, remoteDataStreams } = useMediaContext();
  const { mediasoupSocket, tableSocket } = useSocketContext();
  const { username: activeUsername, instance: activeInstance } =
    useUserInfoContext();
  const { uploader } = useToolsContext();

  const [popupVisible, setPopupVisible] = useState(false);
  const [audioEffectsSectionVisible, setAudioEffectsSectionVisible] =
    useState(false);
  const audioElementSVGRef = useRef<SVGSVGElement | null>(null);

  const [_rerender, setRerender] = useState(false);
  const [adjustingDimensions, setAdjustingDimensions] = useState(false);
  const [inAudioContainer, setInAudioContainer] = useState(false);

  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    defaultActiveSettingsPages,
  );

  const [isBezierCurveEditor, setIsBezierCurveEditor] = useState(false);

  const [containerWidth, setContainerWidth] = useState(0);

  const audioEffectsSectionRef = useRef<HTMLDivElement>(null);

  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);

  const audioContainerRef = useRef<HTMLDivElement>(null);

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
    undefined,
  );

  const fgContentAdjustmentController = useRef<FgContentAdjustmentController>(
    new FgContentAdjustmentController(
      bundleRef,
      positioning,
      setAdjustingDimensions,
      setRerender,
    ),
  );

  const fgAudioElementContainerController = useRef(
    new FgAudioElementContainerController(
      isUser,
      tableId,
      username,
      instance,
      positioning,
      permissions,
      remoteDataStreams,
      positioningListeners,
      setRerender,
      tableSocket,
      behindEffectsContainerRef,
      frontEffectsContainerRef,
      audioContainerRef,
      setAudioEffectsSectionVisible,
      mediasoupSocket,
      handleDisableEnableBtns,
      isAudio,
      setAudioActive,
      fgContentAdjustmentController,
      bundleRef,
    ),
  );

  useEffect(() => {
    if (
      !remoteDataStreams.current ||
      (isUser && !permissions.acceptsAudioEffects)
    ) {
      fgAudioElementContainerController.current.attachListeners();
    }

    // Request initial catch up data
    if (!isUser && activeUsername.current && activeInstance.current) {
      mediasoupSocket.current?.sendMessage({
        type: "requestCatchUpData",
        header: {
          tableId: tableId,
          inquiringUsername: activeUsername.current,
          inquiringInstance: activeInstance.current,
          inquiredUsername: username,
          inquiredInstance: instance,
          inquiredType: "audio",
        },
      });
    }

    mediasoupSocket.current?.addMessageListener(
      fgAudioElementContainerController.current.handleMediasoupMessage,
    );
    tableSocket.current?.addMessageListener(
      fgAudioElementContainerController.current.handleTableMessage,
    );

    document.addEventListener(
      "keydown",
      fgAudioElementContainerController.current.handleKeyDown,
    );

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      mediasoupSocket.current?.removeMessageListener(
        fgAudioElementContainerController.current.handleMediasoupMessage,
      );
      tableSocket.current?.removeMessageListener(
        fgAudioElementContainerController.current.handleTableMessage,
      );
      document.removeEventListener(
        "keydown",
        fgAudioElementContainerController.current.handleKeyDown,
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!audioContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!audioContainerRef.current) {
        return;
      }
      setContainerWidth(audioContainerRef.current.clientWidth);
    });

    observer.observe(audioContainerRef.current);

    return () => observer.disconnect();
  }, [audioContainerRef.current]);

  useEffect(() => {
    if (
      adjustingDimensions &&
      (isUser || permissions.acceptsAudioEffects) &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          tableId,
          username,
          instance,
          type: "audio",
          positioning: positioning.current,
        }),
      );
    }
  }, [positioning.current]);

  const handleFileUpload = async (blob: Blob, name?: string) => {
    const file = new File([blob], `${name ? name + ".svg" : "image.svg"}`, {
      type: "image/svg+xml",
    });
    uploader.current?.uploadToMuteStyle(file, ["muteStyle"]);
  };

  return (
    <div
      ref={audioContainerRef}
      id={`${username}_${instance}_audio_element_container`}
      className={`audio-element-container ${
        adjustingDimensions ? "adjusting-dimensions" : ""
      } ${inAudioContainer ? "in-audio-container" : ""} pointer-events-auto z-base-content`}
      style={{
        position: "relative",
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y,
        )}%`,
        height: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y,
        )}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 50%",
      }}
      onPointerEnter={() => {
        setInAudioContainer(true);
        if (leaveAudioContainerTimer.current) {
          clearTimeout(leaveAudioContainerTimer.current);
          leaveAudioContainerTimer.current = undefined;
        }
      }}
      onPointerLeave={() => {
        leaveAudioContainerTimer.current = setTimeout(() => {
          setInAudioContainer(false);
          clearTimeout(leaveAudioContainerTimer.current);
          leaveAudioContainerTimer.current = undefined;
        }, fgAudioElementContainerOptions.controlsVanishTime);
      }}
      data-positioning={JSON.stringify(positioning.current)}
    >
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
      <PanButton
        className="pan-btn absolute top-1/2 aspect-square w-[8%] min-w-7 max-w-14 -translate-y-1/2"
        style={{ right: `calc(100% - ${Math.round(containerWidth * 0.05)}px)` }}
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

          fgContentAdjustmentController.current?.movementDragFunction(
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
            },
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={() => {
          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
            "position",
            { rotationPointPlacement: "middleLeft" },
          );
        }}
        pointerUpFunction={
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction
        }
      />
      <RotateButton
        className="rotate-btn absolute top-1/2 aspect-square w-[8%] min-w-7 max-w-14 -translate-y-[150%]"
        style={{ left: `calc(100% - ${Math.round(containerWidth * 0.05)}px)` }}
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

          fgContentAdjustmentController.current?.rotateDragFunction(event, {
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
        pointerDownFunction={() =>
          fgContentAdjustmentController.current
            ?.adjustmentBtnPointerDownFunction
        }
        pointerUpFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction
        }
      />
      <ScaleButton
        className="scale-btn absolute top-1/2 aspect-square w-[7.5%] min-w-6 max-w-12 translate-y-1/2"
        style={{ left: `calc(100% - ${Math.round(containerWidth * 0.05)}px)` }}
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

          fgContentAdjustmentController.current?.scaleDragFunction(
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
            },
          );
        }}
        bundleRef={bundleRef}
        pointerDownFunction={() => {
          if (!bundleRef.current) {
            return;
          }

          fgContentAdjustmentController.current?.adjustmentBtnPointerDownFunction(
            "scale",
          );
        }}
        pointerUpFunction={() =>
          fgContentAdjustmentController.current?.adjustmentBtnPointerUpFunction
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
        settings={settings}
      />
      {popupVisible && (
        <Suspense fallback={<div>Loading...</div>}>
          <FgPortal
            type="mouse"
            content={
              <div className="relative z-[50] h-max w-max rounded-md bg-white px-4 py-2 font-Josefin text-lg shadow-lg">
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
              externalRef={audioEffectsSectionRef}
              tableId={tableId}
              username={username}
              instance={instance}
              isUser={isUser}
              permissions={permissions}
              producerType={"audio"}
              producerId={undefined}
              handleAudioEffectChange={
                handleAudioEffectChange as (
                  producerType: "audio" | "screenAudio" | "video",
                  producerId: string | undefined,
                  effect: AudioEffectTypes,
                ) => void
              }
              placement="right"
              referenceElement={
                audioElementSVGRef as unknown as React.RefObject<HTMLElement>
              }
              padding={12}
              handleMute={
                handleMute as (
                  producerType: "audio" | "screenAudio" | "video",
                  producerId: string | undefined,
                ) => void
              }
              localMute={localMute}
              clientMute={clientMute}
              closeCallback={() => setAudioEffectsSectionVisible(false)}
              items={[
                <SettingsButton
                  settingsActive={settingsActive}
                  setSettingsActive={setSettingsActive}
                  activePages={activePages}
                  setActivePages={setActivePages}
                  settings={settings}
                  setSettings={setSettings}
                  scrollingContainerRef={audioEffectsSectionRef}
                  setIsBezierCurveEditor={setIsBezierCurveEditor}
                />,
                <ReactButton
                  className="w-full min-w-12 rounded bg-fg-tone-black-4 hover:bg-fg-red-light"
                  reactionsPanelActive={reactionsPanelActive}
                  setReactionsPanelActive={setReactionsPanelActive}
                  clickFunction={() => setReactionsPanelActive((prev) => !prev)}
                  reactionFunction={
                    fgAudioElementContainerController.current.reactController
                      .handleReaction
                  }
                  options={{ hoverType: "above", hoverTimeoutDuration: 750 }}
                />,
              ]}
            />
          </Suspense>
        )}
      {isBezierCurveEditor && (
        <Bezier
          confirmBezierCurveFunction={(_url, _svg, _d, blob, name) => {
            handleFileUpload(blob, name);

            setIsBezierCurveEditor(false);
          }}
          closeFunction={() => setIsBezierCurveEditor(false)}
          needsName={true}
          handles={true}
        />
      )}
    </div>
  );
}
