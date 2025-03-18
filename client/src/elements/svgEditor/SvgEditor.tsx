import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, Transition, Variants } from "framer-motion";
import {
  ActivePages,
  SvgEditorPoint,
  defaultActivePages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import SvgEditorController from "./lib/SvgEditorController";
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
import { parse } from "svg-path-parser";
import "./lib/svgEditor.css";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const SvgEditorVar: Variants = {
  init: { opacity: 0 },
  animate: {
    opacity: 1,
  },
};

const SvgEditorTransition: Transition = {
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

export default function SvgEditor({
  initSvg,
  confirmFunction,
  closeFunction,
}: {
  initSvg: SVGSVGElement;
  confirmFunction?: (
    url: string,
    svg: string,
    d: string,
    blob: Blob,
    name?: string,
    filters?: string
  ) => void;
  closeFunction?: () => void;
}) {
  const [points, setPoints] = useState<SvgEditorPoint[][]>([]);
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
  const [inSvgEditor, setInSvgEditor] = useState(true);
  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [aspectSquarish, setAspectSquarish] = useState<boolean>(false);
  const [pathHovered, setPathHovered] = useState(true);

  const svgEditorBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const svgEditorContainerRef = useRef<HTMLDivElement>(null);
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

  const svgEditorController = new SvgEditorController(
    points,
    setPoints,
    svgEditorContainerRef,
    svgEditorBackgroundContainerRef,
    svgRef,
    setInSvgEditor,
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
    confirmFunction,
    selectionBox,
    setSelectionBox
  );

  useEffect(() => {
    svgEditorContainerRef.current?.appendChild(initSvg);

    document.addEventListener(
      "keydown",
      svgEditorController.handleKeyDown,
      true
    );
    document.addEventListener("keyup", svgEditorController.handleKeyUp);
    document.addEventListener("wheel", svgEditorController.handleWheel);

    return () => {
      document.removeEventListener(
        "keydown",
        svgEditorController.handleKeyDown,
        true
      );
      document.removeEventListener("keyup", svgEditorController.handleKeyUp);
      document.removeEventListener("wheel", svgEditorController.handleWheel);
    };
  }, []);

  useLayoutEffect(() => {
    if (!svgEditorBackgroundContainerRef.current) {
      return;
    }

    const observer = new ResizeObserver(svgEditorController.handleResize);

    observer.observe(svgEditorBackgroundContainerRef.current);

    return () => observer.disconnect();
  }, [svgEditorBackgroundContainerRef.current]);

  useEffect(() => {
    if (
      svgEditorController.isOneDragging(points) ||
      svgEditorController.isOneHovered(points)
    ) {
      if (leavePathTimeout.current) {
        clearTimeout(leavePathTimeout.current);
        leavePathTimeout.current = undefined;
      }
    }
  }, [
    svgEditorController.isOneDragging(points),
    svgEditorController.isOneHovered(points),
  ]);

  const extractSvgPoints = (svg: SVGSVGElement): SvgEditorPoint[][] => {
    const paths = Array.from(svg.querySelectorAll("path"));

    return paths.map((path) => {
      const d = path.getAttribute("d");
      if (!d) return [];

      const parsedCommands = parse(d);
      const points: SvgEditorPoint[] = parsedCommands.map((cmd) => {
        const isCurve = cmd.code === "C" || cmd.code === "S";

        return {
          type: "endPoint", // Defaulting to "endPoint", can be adjusted based on logic
          x: cmd.x || 0,
          y: cmd.y || 0,
          selected: false,
          inSelectionBox: false,
          dragging: false,
          hovering: false,
          controlType: "None", // Replace with appropriate ControlTypes
          controls: isCurve
            ? {
                controlOne:
                  cmd.x1 && cmd.y1
                    ? { x: cmd.x1, y: cmd.y1, dragging: false }
                    : undefined,
                controlTwo:
                  cmd.x2 && cmd.y2
                    ? { x: cmd.x2, y: cmd.y2, dragging: false }
                    : undefined,
              }
            : {},
        };
      });

      return points;
    });
  };

  return (
    <FgPortal
      type='staticTopDomain'
      top={0}
      left={0}
      zValue={500000000001}
      className='w-screen h-screen'
      content={
        <div
          ref={svgEditorBackgroundContainerRef}
          className='flex w-full h-full bg-fg-tone-black-4 bg-opacity-45 pointer-events-none items-center justify-center'
        >
          <div
            ref={svgEditorContainerRef}
            className={`${
              largestDim === "height"
                ? aspectSquarish
                  ? "w-[80%]"
                  : "w-[95%]"
                : aspectSquarish
                ? "h-[80%]"
                : "h-[95%]"
            } ${
              !inSvgEditor &&
              !settingsActive &&
              !svgEditorController.isOneSelected(points) &&
              !svgEditorController.isOneHovered(points) &&
              !svgEditorController.isOneInSelectionBox(points)
                ? "cursor-none"
                : ""
            } aspect-square relative border-2 rounded`}
            onPointerEnter={svgEditorController.handlePointerEnterSvgEditor}
            onPointerLeave={svgEditorController.handlePointerLeaveSvgEditor}
            style={{
              backgroundImage: `
                linear-gradient(45deg, #3e3e3e 25%, transparent 25%, transparent 75%, #3e3e3e 75%, #3e3e3e),
                linear-gradient(45deg, #3e3e3e 25%, #1a1a1a 25%, #1a1a1a 75%, #3e3e3e 75%,#3e3e3e)
              `,
              backgroundSize: "48px 48px",
              backgroundPosition: "0 0, 24px 24px",
            }}
          >
            {(inSvgEditor ||
              settingsActive ||
              svgEditorController.isOneSelected(points) ||
              svgEditorController.isOneInSelectionBox(points) ||
              svgEditorController.isOneHovered(points)) && (
              <motion.div
                variants={SvgEditorVar}
                initial='init'
                animate='animate'
                exit='init'
                transition={SvgEditorTransition}
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
                        svgEditorController={svgEditorController}
                        largestDim={largestDim}
                      />
                      <CloseButton
                        closeFunction={closeFunction}
                        largestDim={largestDim}
                      />
                    </>
                  )}
                  <ConfirmButton
                    svgEditorController={svgEditorController}
                    largestDim={largestDim}
                  />
                  {largestDim === "width" && (
                    <>
                      <CloseButton
                        closeFunction={closeFunction}
                        largestDim={largestDim}
                      />
                      <ResetButton
                        svgEditorController={svgEditorController}
                        largestDim={largestDim}
                      />
                    </>
                  )}
                </div>
                {(svgEditorController.isOneSelectedExcludeEndPoints(points) ||
                  svgEditorController.isOneHoveredExcludeEndPoints(points)) && (
                  <PointControlsSection
                    svgEditorController={svgEditorController}
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
                    svgEditorController={svgEditorController}
                    copied={copied}
                    largestDim={largestDim}
                  />
                  <DownloadButton
                    svgEditorController={svgEditorController}
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
          </div>
        </div>
      }
      options={{ animate: false }}
    />
  );
}
