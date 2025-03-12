import React, { useState, useRef, useEffect } from "react";
import { motion, Transition, Variants } from "framer-motion";
import { BezierPoint } from "./lib/typeConstant";
import BezierController from "./lib/BezierController";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import "./lib/bezier.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const freeControlsIcon = nginxAssetServerBaseUrl + "svgs/freeControlsIcon.svg";
const inlineControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineControlsIcon.svg";
const inlineSymmetricControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineSymmetricControlsIcon.svg";
const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

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

export default function Bezier() {
  const [points, setPoints] = useState<BezierPoint[]>([
    {
      type: "endPoint",
      x: 16,
      y: 50,
      selected: false,
      dragging: false,
      hovering: false,
      controlType: "free",
      controls: { controlOne: { x: 30, y: 10, dragging: false } },
    },
    {
      type: "endPoint",
      x: 84,
      y: 50,
      selected: false,
      dragging: false,
      hovering: false,
      controlType: "free",
      controls: { controlOne: { x: 70, y: 90, dragging: false } },
    },
  ]);
  const [inBezier, setInBezier] = useState(true);

  const bezierContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const leaveTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const movementTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const bezierController = new BezierController(
    points,
    setPoints,
    bezierContainerRef,
    svgRef,
    setInBezier,
    leaveTimer,
    movementTimeout,
    shiftPressed,
    controlPressed
  );

  useEffect(() => {
    document.addEventListener("keydown", bezierController.handleKeyDown);
    document.addEventListener("keyup", bezierController.handleKeyUp);

    return () => {
      document.removeEventListener("keydown", bezierController.handleKeyDown);
      document.removeEventListener("keyup", bezierController.handleKeyUp);
    };
  }, []);

  return (
    <div
      ref={bezierContainerRef}
      className='w-1/2 aspect-square bg-fg-tone-black-1 absolute top-0 left-0'
      onPointerEnter={bezierController.handlePointerEnterBezier}
      onPointerLeave={bezierController.handlePointerLeaveBezier}
    >
      <svg
        ref={svgRef}
        viewBox='0 0 100 100'
        className='w-full h-full'
        onDoubleClick={bezierController.handleDoubleClick}
        onPointerDown={bezierController.handleSVGClick}
      >
        <path
          d={bezierController.getPathData()}
          stroke='#f2f2f2'
          fill='none'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* Handle lines */}
        {points.map(
          (point, index) =>
            point.selected &&
            Object.entries(point.controls).map(([controlType, basePoint]) => (
              <line
                key={`line-${index}-${controlType}`}
                x1={point.x}
                y1={point.y}
                x2={basePoint.x}
                y2={basePoint.y}
                stroke='#b20203'
                strokeOpacity='0.5'
                strokeDasharray={2}
                strokeWidth={0.5}
              />
            ))
        )}

        {/* Points */}
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            {(point.controlType === "inline" || point.type === "endPoint") && (
              <circle
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
                  point.selected || point.type === "endPoint"
                    ? "#d40213"
                    : "blue"
                }
                onPointerDown={(event) =>
                  bezierController.handlePointerDown(event, index)
                }
                onPointerEnter={() =>
                  bezierController.handlePointerEnter(index)
                }
                onPointerLeave={bezierController.handlePointerLeave}
              />
            )}

            {point.type !== "endPoint" &&
              point.controlType === "inlineSymmetric" && (
                <rect
                  className={`svg-editor-split-point ${
                    point.dragging ? "dragging" : ""
                  } ${point.selected ? "selected" : ""} ${
                    point.hovering ? "hovering" : ""
                  }`}
                  x={point.x - (point.hovering ? 1.25 : 1)}
                  y={point.y - (point.hovering ? 1.25 : 1)}
                  width={point.hovering ? "2.5" : "2"}
                  height={point.hovering ? "2.5" : "2"}
                  fill={point.selected || point.hovering ? "#d40213" : "blue"}
                  transform={`rotate(45 ${point.x} ${point.y})`}
                  onPointerDown={(event) =>
                    bezierController.handlePointerDown(event, index)
                  }
                  onPointerEnter={() =>
                    bezierController.handlePointerEnter(index)
                  }
                  onPointerLeave={bezierController.handlePointerLeave}
                />
              )}

            {point.type !== "endPoint" && point.controlType === "free" && (
              <rect
                className={`svg-editor-split-point ${
                  point.dragging ? "dragging" : ""
                } ${point.selected ? "selected" : ""} ${
                  point.hovering ? "hovering" : ""
                }`}
                x={point.x - (point.hovering ? 1.25 : 1)}
                y={point.y - (point.hovering ? 1.25 : 1)}
                width={point.hovering ? "2.5" : "2"}
                height={point.hovering ? "2.5" : "2"}
                fill={point.selected || point.hovering ? "#d40213" : "blue"}
                onPointerDown={(event) =>
                  bezierController.handlePointerDown(event, index)
                }
                onPointerEnter={() =>
                  bezierController.handlePointerEnter(index)
                }
                onPointerLeave={bezierController.handlePointerLeave}
              />
            )}

            {point.selected &&
              Object.entries(point.controls).map(([controlType, basePoint]) => (
                <circle
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
                />
              ))}
          </g>
        ))}
      </svg>
      {inBezier && (
        <motion.div
          className='absolute top-0 left-0 w-full h-full z-10 pointer-events-none'
          variants={BezierVar}
          initial='init'
          animate='animate'
          exit='init'
          transition={BezierTransition}
        >
          {(bezierController.isOneSelected(points) ||
            bezierController.isOneHovered(points)) && (
            <motion.div
              className='absolute top-0 w-full h-[16%] max-h-16 min-h-10 flex items-center justify-end z-20 px-4'
              variants={BezierVar}
              initial='init'
              animate='animate'
              exit='init'
              transition={BezierTransition}
            >
              <div className='flex items-center justify-center space-x-2 h-full w-max'>
                <FgButton
                  className='h-full aspect-square pointer-events-auto'
                  clickFunction={(event) => {
                    event.stopPropagation();
                    bezierController.swapControlType("free");
                  }}
                  contentFunction={() => (
                    <FgSVG
                      src={freeControlsIcon}
                      className='h-full w-full stroke-fg-white'
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content='Free' style='light' />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 1750,
                    hoverType: "below",
                    hoverZValue: 500000000,
                  }}
                />
                <FgButton
                  className='h-full aspect-square pointer-events-auto'
                  clickFunction={(event) => {
                    event.stopPropagation();
                    bezierController.swapControlType("inlineSymmetric");
                  }}
                  contentFunction={() => (
                    <FgSVG
                      src={inlineSymmetricControlsIcon}
                      className='h-full w-full stroke-fg-white'
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard
                      content='Symmetric inline'
                      style='light'
                    />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 1750,
                    hoverType: "below",
                    hoverZValue: 500000000,
                  }}
                />
                <FgButton
                  className='h-full aspect-square pointer-events-auto'
                  clickFunction={(event) => {
                    event.stopPropagation();
                    bezierController.swapControlType("inline");
                  }}
                  contentFunction={() => (
                    <FgSVG
                      src={inlineControlsIcon}
                      className='h-full w-full stroke-fg-white'
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content='Inline' style='light' />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 1750,
                    hoverType: "below",
                    hoverZValue: 500000000,
                  }}
                />
              </div>
            </motion.div>
          )}
          <div className='absolute bottom-0 w-full h-[16%] max-h-16 min-h-10 flex items-center justify-center z-20'>
            <FgButton
              className='flex h-full aspect-square pointer-events-auto items-center justify-center'
              clickFunction={(event) => {
                event.stopPropagation();
                bezierController.downloadBezierCurve();
              }}
              contentFunction={() => (
                <FgSVG
                  src={downloadIcon}
                  className='flex h-[85%] aspect-square items-center justify-center'
                  attributes={[
                    { key: "fill", value: "#f2f2f2" },
                    { key: "stroke", value: "#f2f2f2" },
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                  ]}
                />
              )}
              hoverContent={
                <FgHoverContentStandard content='Download' style='light' />
              }
              options={{
                hoverSpacing: 4,
                hoverTimeoutDuration: 1750,
                hoverType: "above",
                hoverZValue: 500000000,
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
