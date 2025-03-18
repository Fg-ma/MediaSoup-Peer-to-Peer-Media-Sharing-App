import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, Transition, Variants } from "framer-motion";
import {
  ActivePages,
  BezierPoint,
  defaultActivePages,
  defaultPoints,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import BezierController from "./lib/BezierController";
import FgPortal from "../fgPortal/FgPortal";
import PointControlsSection from "./lib/pointControlsSection/PointControlsSection";
import ConfirmButton from "./lib/confirmButton/ConfirmButton";
import SettingsButton from "./lib/settingsButton/SettingsButton";
import CopyButton from "./lib/copyButton /CopyButton";
import DownloadButton from "./lib/downloadButton/DownloadButton";
import ResetButton from "./lib/restButton/ResetButton";
import CloseButton from "./lib/closeButton/CloseButton";
import FgInput from "../fgInput/FgInput";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import "./lib/bezier.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const BezierVar: Variants = {
  init: { opacity: 0 },
  animate: {
    opacity: 1,
  },
};

const BezierTransition: Transition = {
  transition: {
    opacity: { duration: 0.1 },
  },
};

const NamePopupVar: Variants = {
  init: { opacity: 0, top: "20%" },
  animate: {
    opacity: 1,
    top: "30%",
  },
};

const NamePopupTransition: Transition = {
  transition: {
    opacity: { duration: 0.1 },
    top: { duration: 0.1 },
  },
};

export default function Bezier({
  confirmBezierCurveFunction,
  closeFunction,
  needsName = false,
  handles = false,
}: {
  confirmBezierCurveFunction?: (
    url: string,
    svg: string,
    d: string,
    blob: Blob,
    name?: string,
    filters?: string
  ) => void;
  closeFunction?: () => void;
  needsName?: boolean;
  handles?: boolean;
}) {
  const [points, setPoints] = useState<BezierPoint[]>(
    structuredClone(defaultPoints)
  );
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    active: false,
  });
  const [inBezier, setInBezier] = useState(true);
  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [aspectSquarish, setAspectSquarish] = useState<boolean>(false);
  const [pathHovered, setPathHovered] = useState(true);

  const bezierBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const bezierContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const leavePathTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const copiedTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const [settingsActive, setSettingsActive] = useState(false);
  const [activePages, setActivePages] = useState<ActivePages>(
    structuredClone(defaultActivePages)
  );
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [copied, setCopied] = useState(false);

  const name = useRef<string | undefined>(undefined);
  const [getNamePopupActive, setGetNamePopupActive] = useState(false);

  const bezierController = new BezierController(
    points,
    setPoints,
    bezierContainerRef,
    bezierBackgroundContainerRef,
    svgRef,
    setInBezier,
    setLargestDim,
    setAspectSquarish,
    leaveTimer,
    movementTimeout,
    leavePathTimeout,
    shiftPressed,
    controlPressed,
    settings,
    setSettings,
    setSettingsActive,
    copiedTimeout,
    setCopied,
    confirmBezierCurveFunction,
    selectionBox,
    setSelectionBox,
    name,
    handles
  );

  useEffect(() => {
    document.addEventListener("keydown", bezierController.handleKeyDown, true);
    document.addEventListener("keyup", bezierController.handleKeyUp);
    document.addEventListener("wheel", bezierController.handleWheel);

    return () => {
      document.removeEventListener(
        "keydown",
        bezierController.handleKeyDown,
        true
      );
      document.removeEventListener("keyup", bezierController.handleKeyUp);
      document.removeEventListener("wheel", bezierController.handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!bezierBackgroundContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(bezierController.handleResize);

    observer.observe(bezierBackgroundContainerRef.current);

    return () => observer.disconnect();
  }, [bezierBackgroundContainerRef.current]);

  useEffect(() => {
    if (
      bezierController.isOneDragging(points) ||
      bezierController.isOneHovered(points)
    ) {
      if (leavePathTimeout.current) {
        clearTimeout(leavePathTimeout.current);
        leavePathTimeout.current = undefined;
      }
    }
  }, [
    bezierController.isOneDragging(points),
    bezierController.isOneHovered(points),
  ]);

  return (
    <FgPortal
      type='staticTopDomain'
      top={0}
      left={0}
      zValue={500000000001}
      className='w-screen h-screen'
      content={
        <div
          ref={bezierBackgroundContainerRef}
          className='flex w-full h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-none items-center justify-center'
        >
          <div
            ref={bezierContainerRef}
            className={`${
              largestDim === "height"
                ? aspectSquarish
                  ? "w-[80%]"
                  : "w-[95%]"
                : aspectSquarish
                ? "h-[80%]"
                : "h-[95%]"
            } ${
              !inBezier &&
              !settingsActive &&
              !bezierController.isOneSelected(points) &&
              !bezierController.isOneHovered(points) &&
              !bezierController.isOneInSelectionBox(points)
                ? "cursor-none"
                : ""
            } aspect-square relative border-2 rounded`}
            onPointerEnter={bezierController.handlePointerEnterBezier}
            onPointerLeave={bezierController.handlePointerLeaveBezier}
            style={{
              backgroundImage: `
                linear-gradient(45deg, #3e3e3e 25%, transparent 25%, transparent 75%, #3e3e3e 75%, #3e3e3e),
                linear-gradient(45deg, #3e3e3e 25%, #1a1a1a 25%, #1a1a1a 75%, #3e3e3e 75%,#3e3e3e)
              `,
              backgroundSize: "48px 48px",
              backgroundPosition: "0 0, 24px 24px",
            }}
          >
            <svg
              ref={svgRef}
              viewBox='0 0 100 100'
              className='w-full h-full pointer-events-auto rounded overflow-hidden'
              onDoubleClick={bezierController.handleDoubleClick}
              onPointerDown={bezierController.handleSVGPointerDown}
              onPointerUp={bezierController.handleSVGPointerUp}
              onPointerMove={bezierController.handleSVGPointerMove}
              style={{ backgroundColor: settings.backgroundColor.value }}
            >
              <defs>
                <filter
                  id='bezierShadowFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feGaussianBlur
                    in='SourceAlpha'
                    stdDeviation={settings.filters.shadow.strength.value}
                    result='blur'
                  />
                  <feOffset
                    in='blur'
                    dx={settings.filters.shadow.offsetX.value}
                    dy={settings.filters.shadow.offsetY.value}
                    result='offsetBlur'
                  />

                  <feFlood
                    floodColor={settings.filters.shadow.shadowColor.value}
                    result='colorBlur'
                  />
                  <feComposite
                    in='colorBlur'
                    in2='offsetBlur'
                    operator='in'
                    result='coloredBlur'
                  />

                  <feMerge>
                    <feMergeNode in='coloredBlur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>

                <filter
                  id='bezierBlurFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feGaussianBlur
                    in='SourceGraphic'
                    stdDeviation={settings.filters.blur.strength.value}
                  />
                </filter>

                <filter
                  id='bezierGrayscaleFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feColorMatrix
                    type='saturate'
                    values={`${settings.filters.grayscale.scale.value}`}
                  />
                </filter>

                <filter
                  id='bezierSaturateFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feColorMatrix
                    type='saturate'
                    values={`${settings.filters.saturate.saturation.value}`}
                  />
                </filter>

                <filter
                  id='bezierEdgeDetectionFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feConvolveMatrix
                    order='3'
                    kernelMatrix=' -1 -1 -1 -1 8 -1 -1 -1 -1 '
                    result='edgeDetected'
                  />
                </filter>

                <filter
                  id='bezierColorOverlayFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feFlood
                    floodColor={
                      settings.filters.colorOverlay.overlayColor.value
                    }
                    result='flood'
                  />
                  <feComposite
                    in2='SourceAlpha'
                    operator='in'
                    result='overlay'
                  />
                  <feComposite
                    in='overlay'
                    in2='SourceGraphic'
                    operator='over'
                  />
                </filter>

                <filter
                  id='bezierWaveDistortionFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feTurbulence
                    type='fractalNoise'
                    baseFrequency={
                      settings.filters.waveDistortion.frequency.value
                    }
                    result='turbulence'
                  />
                  <feDisplacementMap
                    in='SourceGraphic'
                    in2='turbulence'
                    scale={settings.filters.waveDistortion.strength.value}
                  />
                </filter>

                <filter
                  id='bezierCrackedGlassFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feTurbulence
                    type='fractalNoise'
                    baseFrequency={settings.filters.crackedGlass.density.value}
                    numOctaves={Math.round(
                      settings.filters.crackedGlass.detail.value
                    )}
                    result='turbulence'
                  />
                  <feDisplacementMap
                    in='SourceGraphic'
                    in2='turbulence'
                    scale={settings.filters.crackedGlass.strength.value}
                  />
                </filter>

                <filter
                  id='bezierNeonGlowFilter'
                  x='-2000'
                  y='-2000'
                  width='4000'
                  height='4000'
                >
                  <feGaussianBlur
                    in='SourceAlpha'
                    stdDeviation='3'
                    result='blurred'
                  />
                  <feFlood
                    floodColor={settings.filters.neonGlow.neonColor.value}
                    result='glowColor'
                  />
                  <feComposite
                    in='glowColor'
                    in2='blurred'
                    operator='in'
                    result='glow'
                  />
                  <feComposite in='SourceGraphic' in2='glow' operator='over' />
                </filter>
              </defs>

              <g
                filter={
                  bezierController.isFilter()
                    ? bezierController.getFilterURLs()
                    : undefined
                }
              >
                <path
                  d={bezierController.getPathData()}
                  stroke={settings.color.value}
                  fill='none'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  onPointerEnter={() => setPathHovered(true)}
                  onPointerLeave={() => {
                    if (bezierController.isOneSelected(points)) return;

                    if (leavePathTimeout.current) {
                      clearTimeout(leavePathTimeout.current);
                      leavePathTimeout.current = undefined;
                    }
                    leavePathTimeout.current = setTimeout(() => {
                      setPathHovered(false);
                    }, 2500);
                  }}
                />
              </g>

              {!getNamePopupActive && selectionBox.active && (
                <rect
                  x={Math.min(
                    selectionBox.x,
                    selectionBox.x + selectionBox.width
                  )}
                  y={Math.min(
                    selectionBox.y,
                    selectionBox.y + selectionBox.height
                  )}
                  width={Math.abs(selectionBox.width)}
                  height={Math.abs(selectionBox.height)}
                  fill='rgba(29, 105, 202, 0.2)'
                  stroke='#1d69ca '
                  rx={0.5}
                  ry={0.5}
                  strokeWidth='0.5'
                  strokeDasharray='2'
                />
              )}

              {!getNamePopupActive && (pathHovered || selectionBox.active) && (
                <>
                  {/* Control handle lines */}
                  {points.map(
                    (point, index) =>
                      point.selected &&
                      Object.entries(point.controls).map(
                        ([controlType, basePoint]) => (
                          <motion.line
                            key={`line-${index}-${controlType}`}
                            x1={point.x}
                            y1={point.y}
                            x2={basePoint.x}
                            y2={basePoint.y}
                            stroke='#f78528'
                            strokeOpacity='0.8'
                            strokeDasharray={2}
                            strokeWidth={0.5}
                            {...fadeIn}
                          />
                        )
                      )
                  )}

                  {/* Points */}
                  {points.map((point, index) => (
                    <motion.g key={`point-${index}`} {...fadeIn}>
                      {(point.controlType === "inline" ||
                        point.type === "endPoint") && (
                        <motion.circle
                          className={`cursor-pointer ${
                            point.type === "endPoint"
                              ? "svg-editor-end-point"
                              : "svg-editor-split-point"
                          } ${point.dragging ? "dragging" : ""} ${
                            point.selected ? "selected" : ""
                          } ${point.hovering ? "hovering" : ""}`}
                          cx={point.x}
                          cy={point.y}
                          r={point.type === "endPoint" ? "1.25" : "1"}
                          fill={
                            point.selected ||
                            point.type === "endPoint" ||
                            point.hovering
                              ? "#d40213"
                              : point.inSelectionBox
                              ? "#f78528"
                              : "#1d69ca"
                          }
                          onDoubleClick={(event) => {
                            event.stopPropagation();
                            if (point.type !== "endPoint") {
                              bezierController.cycleControlType(index);
                            }
                          }}
                          onPointerDown={(event) =>
                            bezierController.handlePointerDown(event, index)
                          }
                          onPointerEnter={() =>
                            bezierController.handlePointerEnter(index)
                          }
                          onPointerLeave={bezierController.handlePointerLeave}
                          {...fadeIn}
                        />
                      )}

                      {point.type !== "endPoint" &&
                        point.controlType === "inlineSymmetric" && (
                          <motion.rect
                            className={`cursor-pointer svg-editor-split-point-retangle ${
                              point.dragging ? "dragging" : ""
                            } ${point.selected ? "selected" : ""} ${
                              point.hovering ? "hovering-square" : ""
                            }`}
                            x={point.x}
                            y={point.y}
                            rx={0.25}
                            ry={0.25}
                            fill={
                              point.selected || point.hovering
                                ? "#d40213"
                                : point.inSelectionBox
                                ? "#f78528"
                                : "#1d69ca"
                            }
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              bezierController.cycleControlType(index);
                            }}
                            onPointerDown={(event) =>
                              bezierController.handlePointerDown(event, index)
                            }
                            onPointerEnter={() =>
                              bezierController.handlePointerEnter(index)
                            }
                            onPointerLeave={bezierController.handlePointerLeave}
                            {...fadeIn}
                          />
                        )}

                      {point.type !== "endPoint" &&
                        point.controlType === "free" && (
                          <motion.rect
                            className={`cursor-pointer svg-editor-split-point-square ${
                              point.dragging ? "dragging" : ""
                            } ${point.selected ? "selected" : ""} ${
                              point.hovering ? "hovering-square" : ""
                            }`}
                            x={point.x}
                            y={point.y}
                            rx={0.25}
                            ry={0.25}
                            fill={
                              point.selected || point.hovering
                                ? "#d40213"
                                : point.inSelectionBox
                                ? "#f78528"
                                : "#1d69ca"
                            }
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              bezierController.cycleControlType(index);
                            }}
                            onPointerDown={(event) =>
                              bezierController.handlePointerDown(event, index)
                            }
                            onPointerEnter={() =>
                              bezierController.handlePointerEnter(index)
                            }
                            onPointerLeave={bezierController.handlePointerLeave}
                            {...fadeIn}
                          />
                        )}

                      {point.selected &&
                        Object.entries(point.controls).map(
                          ([controlType, basePoint]) => (
                            <motion.circle
                              key={`cursor-pointer control-${index}-${controlType}`}
                              cx={basePoint.x}
                              cy={basePoint.y}
                              r='0.75'
                              fill='#1a8ca2'
                              className={`svg-editor-control-point ${
                                basePoint.dragging ? "dragging" : ""
                              }`}
                              onPointerDown={(event) =>
                                bezierController.handlePointerDown(
                                  event,
                                  index,
                                  controlType as "controlOne" | "controlTwo"
                                )
                              }
                              {...fadeIn}
                            />
                          )
                        )}
                    </motion.g>
                  ))}
                </>
              )}
            </svg>
            {!getNamePopupActive &&
              (inBezier ||
                settingsActive ||
                bezierController.isOneSelected(points) ||
                bezierController.isOneInSelectionBox(points) ||
                bezierController.isOneHovered(points)) && (
                <motion.div
                  variants={BezierVar}
                  initial='init'
                  animate='animate'
                  exit='init'
                  transition={BezierTransition}
                >
                  <div
                    className={`${
                      largestDim === "width"
                        ? "top-0 left-full ml-2 w-[10%] h-max max-w-16 min-w-8 flex-col space-y-4"
                        : "bottom-full right-0 mb-2 h-[10%] w-max max-h-16 min-h-8 space-x-4"
                    } absolute flex items-center justify-center z-20 pointer-events-none`}
                  >
                    {largestDim === "height" && (
                      <>
                        <ResetButton
                          bezierController={bezierController}
                          largestDim={largestDim}
                        />
                        <CloseButton
                          closeFunction={closeFunction}
                          largestDim={largestDim}
                        />
                      </>
                    )}
                    <ConfirmButton
                      bezierController={bezierController}
                      largestDim={largestDim}
                      needsName={needsName}
                      setGetNamePopupActive={setGetNamePopupActive}
                    />
                    {largestDim === "width" && (
                      <>
                        <CloseButton
                          closeFunction={closeFunction}
                          largestDim={largestDim}
                        />
                        <ResetButton
                          bezierController={bezierController}
                          largestDim={largestDim}
                        />
                      </>
                    )}
                  </div>
                  {(bezierController.isOneSelectedExcludeEndPoints(points) ||
                    bezierController.isOneHoveredExcludeEndPoints(points)) && (
                    <PointControlsSection
                      bezierController={bezierController}
                      largestDim={largestDim}
                    />
                  )}
                  <div
                    className={`${
                      largestDim === "width"
                        ? "bottom-0 left-full ml-2 w-[10%] h-max max-w-16 min-w-8 flex-col space-y-4"
                        : "bottom-full left-0 mb-2 h-[10%] w-max max-h-16 min-h-8 space-x-4"
                    } absolute flex items-center justify-center z-20 pointer-events-none`}
                  >
                    <CopyButton
                      bezierController={bezierController}
                      copied={copied}
                      largestDim={largestDim}
                    />
                    <DownloadButton
                      bezierController={bezierController}
                      largestDim={largestDim}
                    />
                    <SettingsButton
                      settingsActive={settingsActive}
                      setSettingsActive={setSettingsActive}
                      activePages={activePages}
                      setActivePages={setActivePages}
                      settings={settings}
                      setSettings={setSettings}
                      largestDim={largestDim}
                    />
                  </div>
                </motion.div>
              )}
            {getNamePopupActive && (
              <div className='absolute z-100 top-0 left-0 w-full h-full pointer-events-auto'>
                <motion.div
                  className='absolute left-1/2 -translate-x-1/2 flex flex-col space-y-2 w-[60%] min-w-28'
                  variants={NamePopupVar}
                  initial='init'
                  animate='animate'
                  exit='init'
                  transition={NamePopupTransition}
                >
                  <FgInput
                    className='h-12 text-2xl rounded-md'
                    placeholder='Name this beast...'
                    options={{
                      submitButton: false,
                      autoFocus: true,
                      autocomplete: "off",
                    }}
                    onChange={(event) => {
                      event.stopPropagation();
                      event.preventDefault();

                      name.current = event.target.value;
                    }}
                  />
                  <div className='flex items-center justify-center space-x-3'>
                    <FgButton
                      className='flex h-10 w-10 bg-fg-red rounded-full items-center justify-center'
                      clickFunction={() => {
                        bezierController.confirmBezierCurve();
                        setGetNamePopupActive(false);
                      }}
                      contentFunction={() => (
                        <FgSVGElement
                          src={checkIcon}
                          className='w-[75%] h-[75%]'
                          attributes={[
                            { key: "width", value: "100%" },
                            { key: "height", value: "100%" },
                            { key: "fill", value: "#f2f2f2" },
                            { key: "stroke", value: "#f2f2f2" },
                          ]}
                        />
                      )}
                      hoverContent={
                        <FgHoverContentStandard
                          content='Confirm name'
                          style='light'
                        />
                      }
                      options={{
                        hoverSpacing: 4,
                        hoverTimeoutDuration: 1250,
                        hoverType: "above",
                        hoverZValue: 500000000000,
                      }}
                    />
                    <FgButton
                      className='flex h-10 w-10 bg-fg-tone-black-4 rounded-full items-center justify-center'
                      clickFunction={() => setGetNamePopupActive(false)}
                      contentFunction={() => (
                        <FgSVGElement
                          src={closeIcon}
                          className='w-[55%] h-[55%]'
                          attributes={[
                            { key: "width", value: "100%" },
                            { key: "height", value: "100%" },
                            { key: "fill", value: "#f2f2f2" },
                            { key: "stroke", value: "#f2f2f2" },
                          ]}
                        />
                      )}
                      hoverContent={
                        <FgHoverContentStandard
                          content='Cancel'
                          style='light'
                        />
                      }
                      options={{
                        hoverSpacing: 4,
                        hoverTimeoutDuration: 1250,
                        hoverType: "above",
                        hoverZValue: 500000000000,
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
