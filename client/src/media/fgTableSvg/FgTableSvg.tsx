import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useToolsContext } from "../../context/toolsContext/ToolsContext";
import SvgController from "./lib/SvgController";
import LowerSvgController from "./lib/lowerSvgControls/LowerSvgController";
import {
  ActivePages,
  defaultActivePages,
  defaultSettings,
  Settings,
} from "./lib/typeConstant";
import FgMediaContainer from "../fgMediaContainer/FgMediaContainer";
import SvgEffectsButton from "./lib/lowerSvgControls/svgEffectsButton/SvgEffectsButton";
import SvgEffectsSection from "./lib/svgEffectsSection/SvgEffectsSection";
import SettingsButton from "./lib/lowerSvgControls/settingsButton/SettingsButton";
import MethodSvgEditor from "../../methodSvgEditor/MethodSvgEditor";
import FgPortal from "../../elements/fgPortal/FgPortal";
import "./lib/fgSvgStyles.css";

export default function FgTableSvg({
  svgInstanceId,
  bundleRef,
  tableRef,
}: {
  svgInstanceId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { uploader } = useToolsContext();

  const [editing, setEditing] = useState(false);

  const svgMediaInstance = userMedia.current.svg.tableInstances[svgInstanceId];

  const [svgEffectsActive, setSvgEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(svgMediaInstance.initPositioning);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerSvgControlsRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings),
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    structuredClone(defaultActivePages),
  );

  const lowerSvgController = useRef(
    new LowerSvgController(
      svgInstanceId,
      svgMediaInstance,
      svgContainerRef,
      setSvgEffectsActive,
      userEffects,
      userEffectsStyles,
      setSettingsActive,
      settings,
      tableStaticContentSocket,
      setSettings,
      setEditing,
    ),
  );

  const svgController = useRef(
    new SvgController(
      svgInstanceId,
      svgMediaInstance,
      setSettingsActive,
      userEffects,
      userEffectsStyles,
      setRerender,
      subContainerRef,
      positioning,
    ),
  );

  useEffect(() => {
    if (svgMediaInstance.instanceSvg) {
      subContainerRef.current?.appendChild(svgMediaInstance.instanceSvg);
      positioning.current.scale = {
        x: svgMediaInstance.svgMedia.aspect
          ? positioning.current.scale.y * svgMediaInstance.svgMedia.aspect
          : positioning.current.scale.x,
        y: positioning.current.scale.y,
      };

      setRerender((prev) => !prev);
    }
    svgMediaInstance.svgMedia.addSvgListener(
      svgController.current.handleSvgMessages,
    );

    document.addEventListener(
      "keydown",
      lowerSvgController.current.handleKeyDown,
    );

    tableRef.current?.addEventListener(
      "scroll",
      svgController.current.handleTableScroll,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        lowerSvgController.current.handleKeyDown,
      );
      svgMediaInstance.svgMedia.removeSvgListener(
        svgController.current.handleSvgMessages,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        svgController.current.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(structuredClone(defaultActivePages));
  }, [settingsActive]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      svgController.current.handleTableStaticContentMessage,
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        svgController.current.handleTableStaticContentMessage,
      );
  }, [tableStaticContentSocket.current]);

  return (
    <>
      <FgMediaContainer
        downloadingState={svgMediaInstance.svgMedia.loadingState}
        addDownloadListener={
          svgMediaInstance.svgMedia.loadingState === "downloading"
            ? svgMediaInstance.svgMedia.addSvgListener
            : undefined
        }
        removeDownloadListener={
          svgMediaInstance.svgMedia.loadingState === "downloading"
            ? svgMediaInstance.svgMedia.removeSvgListener
            : undefined
        }
        getAspect={svgMediaInstance.getAspect}
        mediaId={svgMediaInstance.svgMedia.svgId}
        mediaInstanceId={svgInstanceId}
        kind="svg"
        initState={svgMediaInstance.svgMedia.state}
        bundleRef={bundleRef}
        backgroundMedia={settings.background.value}
        className="svg-container"
        popupElements={[
          svgEffectsActive ? (
            <SvgEffectsSection
              svgInstanceId={svgInstanceId}
              svgMediaInstance={svgMediaInstance}
              lowerSvgController={lowerSvgController}
              svgContainerRef={svgContainerRef}
            />
          ) : null,
        ]}
        rightLowerControls={[
          <SettingsButton
            svgMediaInstance={svgMediaInstance}
            effectsActive={svgEffectsActive}
            containerRef={svgContainerRef}
            settingsActive={settingsActive}
            setSettingsActive={setSettingsActive}
            activePages={activePages}
            setActivePages={setActivePages}
            settings={settings}
            setSettings={setSettings}
            scrollingContainerRef={rightLowerSvgControlsRef}
            lowerSvgController={lowerSvgController}
          />,
          <SvgEffectsButton
            lowerSvgController={lowerSvgController}
            svgEffectsActive={svgEffectsActive}
            settingsActive={settingsActive}
            scrollingContainerRef={rightLowerSvgControlsRef}
          />,
        ]}
        inMediaVariables={[svgEffectsActive, settingsActive]}
        preventLowerLabelsVariables={[settingsActive, svgEffectsActive]}
        externalPositioning={positioning}
        externalMediaContainerRef={svgContainerRef}
        externalSubContainerRef={subContainerRef}
        externalRightLowerControlsRef={rightLowerSvgControlsRef}
        options={{ gradient: false, adjustmentAnimation: false }}
      />
      {editing && svgMediaInstance.svgMedia.svg && (
        <FgPortal
          type="staticTopDomain"
          top={0}
          left={0}
          zValue={490000}
          className="flex h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-45"
          content={
            <MethodSvgEditor
              editing={editing}
              initialSVGString={() => {
                if (svgMediaInstance.svgMedia.svg) {
                  // Create a deep clone of the original svg element
                  const clonedSVG = svgMediaInstance.svgMedia.svg.cloneNode(
                    true,
                  ) as HTMLElement;

                  // Modify the clone
                  clonedSVG.setAttribute("width", "100");
                  clonedSVG.setAttribute("height", "");

                  // Serialize the cloned SVG to a string
                  return new XMLSerializer().serializeToString(clonedSVG);
                }
              }}
              finishCallback={async (svg) => {
                setEditing(false);

                const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/);
                if (!svgMatch) {
                  console.error("Malformed SVG received:", svg);
                  return;
                }

                const cleanSvgText = svgMatch[0];

                const blob = new Blob([cleanSvgText], {
                  type: "image/svg+xml",
                });

                const file = new File(
                  [blob],
                  svgMediaInstance.svgMedia.filename,
                  {
                    type: "image/svg+xml",
                  },
                );

                uploader.current?.reuploadTableContent(
                  file,
                  svgMediaInstance.svgMedia.svgId,
                );
              }}
              cancelCallback={() => {
                setEditing(false);
              }}
            />
          }
          options={{ animate: false }}
        />
      )}
    </>
  );
}
