import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, Transition, Variants } from "framer-motion";
import {
  ActivePages,
  BezierPoint,
  defaultActivePages,
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
import Gradient from "./lib/Gradient";
import "./lib/bezier.css";

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

export default function Bezier({
  confirmBezierCurveFunction,
}: {
  confirmBezierCurveFunction?: (d: string, filters?: string) => void;
}) {
  const [points, setPoints] = useState<BezierPoint[]>([
    {
      type: "endPoint",
      x: 16,
      y: 50,
      selected: false,
      dragging: false,
      hovering: false,
      controlType: "free",
      controls: { controlOne: { x: 32, y: 50, dragging: false } },
    },
    {
      type: "endPoint",
      x: 84,
      y: 50,
      selected: false,
      dragging: false,
      hovering: false,
      controlType: "free",
      controls: { controlOne: { x: 68, y: 50, dragging: false } },
    },
  ]);
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
  const [controlsHeight, setControlsHeight] = useState(0);
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

  const bezierController = new BezierController(
    points,
    setPoints,
    bezierContainerRef,
    bezierBackgroundContainerRef,
    svgRef,
    setInBezier,
    setLargestDim,
    setControlsHeight,
    leaveTimer,
    movementTimeout,
    leavePathTimeout,
    shiftPressed,
    controlPressed,
    settings,
    copiedTimeout,
    setCopied,
    confirmBezierCurveFunction,
    selectionBox,
    setSelectionBox
  );

  useEffect(() => {
    document.addEventListener("keydown", bezierController.handleKeyDown);
    document.addEventListener("keyup", bezierController.handleKeyUp);

    return () => {
      document.removeEventListener("keydown", bezierController.handleKeyDown);
      document.removeEventListener("keyup", bezierController.handleKeyUp);
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
      zValue={499999998}
      className='w-screen h-screen'
      content={
        <div
          ref={bezierBackgroundContainerRef}
          className='flex w-full h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-none items-center justify-center'
        >
          <div
            ref={bezierContainerRef}
            className={`${largestDim === "height" ? "w-[95%]" : "h-[95%]"} ${
              !inBezier &&
              !settingsActive &&
              !bezierController.isOneSelected(points)
                ? "cursor-none"
                : ""
            } aspect-square bg-fg-tone-black-1 h rounded overflow-hidden relative border-2 border-fg-white`}
            onPointerEnter={bezierController.handlePointerEnterBezier}
            onPointerLeave={bezierController.handlePointerLeaveBezier}
          >
            <svg
              ref={svgRef}
              viewBox='0 0 100 100'
              className='w-full h-full pointer-events-auto'
              onDoubleClick={bezierController.handleDoubleClick}
              onPointerDown={bezierController.handleSVGPointerDown}
              onPointerUp={bezierController.handleSVGPointerUp}
              onPointerMove={bezierController.handleSVGPointerMove}
              style={{ backgroundColor: settings.backgroundColor.value }}
            >
              <defs>
                <filter id='bezierShadowFilter'>
                  <feGaussianBlur
                    in='SourceAlpha'
                    stdDeviation='0.75'
                    result='blur'
                  />
                  <feOffset in='blur' dx='0.25' dy='0.5' result='offsetBlur' />

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
                  x='-20%'
                  y='-20%'
                  width='140%'
                  height='140%'
                >
                  <feGaussianBlur in='SourceGraphic' stdDeviation='2' />
                </filter>

                <filter id='bezierGrayscaleFilter'>
                  <feColorMatrix type='saturate' values='0' />
                </filter>

                <filter id='bezierSaturateFilter'>
                  <feColorMatrix type='saturate' values='2' />
                </filter>

                <filter id='bezierEdgeDetectionFilter'>
                  <feConvolveMatrix
                    order='3'
                    kernelMatrix=' -1 -1 -1 -1 8 -1 -1 -1 -1 '
                    result='edgeDetected'
                  />
                </filter>

                <filter id='bezierColorOverlayFilter'>
                  <feFlood flood-color='rgba(255, 0, 0, 0.5)' result='flood' />
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
                  x='-20%'
                  y='-20%'
                  width='140%'
                  height='140%'
                >
                  <feTurbulence
                    type='fractalNoise'
                    baseFrequency='0.05'
                    result='turbulence'
                  />
                  <feDisplacementMap
                    in='SourceGraphic'
                    in2='turbulence'
                    scale='30'
                  />
                </filter>

                <filter
                  id='bezierCrackedGlassFilter'
                  x='-20%'
                  y='-20%'
                  width='140%'
                  height='140%'
                >
                  <feTurbulence
                    type='fractalNoise'
                    baseFrequency='0.2'
                    numOctaves='2'
                    result='turbulence'
                  />
                  <feDisplacementMap
                    in='SourceGraphic'
                    in2='turbulence'
                    scale='15'
                  />
                </filter>

                <filter
                  id='bezierNeonGlowFilter'
                  x='-40%'
                  y='-40%'
                  width='180%'
                  height='180%'
                >
                  <feGaussianBlur
                    in='SourceAlpha'
                    stdDeviation='3'
                    result='blurred'
                  />
                  <feFlood flood-color='cyan' result='glowColor' />
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
                    }, 3500);
                  }}
                />
              </g>

              {selectionBox.active && (
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
                  fill='rgba(0, 0, 255, 0.2)'
                  stroke='blue'
                  rx={0.5}
                  ry={0.5}
                  strokeWidth='0.5'
                  strokeDasharray='2'
                />
              )}

              {(pathHovered || selectionBox.active) && (
                <>
                  {/* Handle lines */}
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
                            stroke='#b20203'
                            strokeOpacity='0.5'
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
                          className={`${
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
                              : "blue"
                          }
                          onDoubleClick={(event) => {
                            if (point.type !== "endPoint") {
                              event.stopPropagation();
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
                            className={`svg-editor-split-point-retangle ${
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
                                : "blue"
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
                            className={`svg-editor-split-point-square ${
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
                                : "blue"
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
                              key={`control-${index}-${controlType}`}
                              cx={basePoint.x}
                              cy={basePoint.y}
                              r='0.75'
                              fill='green'
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
            {(inBezier ||
              settingsActive ||
              bezierController.isOneSelected(points)) && (
              <motion.div
                className='absolute top-0 left-0 w-full h-full z-10 pointer-events-none'
                variants={BezierVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={BezierTransition}
              >
                <Gradient />
                {(bezierController.isOneSelected(points) ||
                  bezierController.isOneHovered(points)) &&
                  !bezierController.isOneDragging(points) && (
                    <motion.div
                      className='absolute top-0 w-full h-[16%] max-h-16 min-h-10 flex items-center justify-end z-20 px-4 pointer-events-none'
                      variants={BezierVar}
                      initial='init'
                      animate='animate'
                      exit='init'
                      transition={BezierTransition}
                    >
                      <PointControlsSection
                        bezierController={bezierController}
                      />
                    </motion.div>
                  )}
                {!bezierController.isOneDragging(points) && (
                  <div className='absolute bottom-[2%] w-full h-[12%] max-h-16 min-h-8 flex items-center justify-center z-20 pointer-events-none space-x-4'>
                    <div
                      className='flex h-[80%] items-center justify-end space-x-1'
                      style={{
                        width: `calc(50% - ${controlsHeight / 2 - 32}px)`,
                      }}
                    >
                      <CopyButton
                        bezierController={bezierController}
                        copied={copied}
                      />
                      <DownloadButton bezierController={bezierController} />
                    </div>
                    <ConfirmButton bezierController={bezierController} />
                    <div
                      className='flex h-[80%] items-center justify-start space-x-1'
                      style={{
                        width: `calc(50% - ${controlsHeight / 2 - 32}px)`,
                      }}
                    >
                      <SettingsButton
                        bezierController={bezierController}
                        settingsActive={settingsActive}
                        setSettingsActive={setSettingsActive}
                        activePages={activePages}
                        setActivePages={setActivePages}
                        settings={settings}
                        setSettings={setSettings}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
