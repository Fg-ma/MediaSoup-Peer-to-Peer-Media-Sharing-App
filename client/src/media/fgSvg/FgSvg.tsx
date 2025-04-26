import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
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

const staticContentServerBaseUrl = process.env.STATIC_CONTENT_SERVER_BASE_URL;

export default function FgSvg({
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
  const { table_id } = useUserInfoContext();

  const [editing, setEditing] = useState(false);

  const svgMediaInstance = userMedia.current.svg.instances[svgInstanceId];

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

  const lowerSvgController = new LowerSvgController(
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
  );

  const svgController = new SvgController(
    svgInstanceId,
    svgMediaInstance,
    setSettingsActive,
    userEffects,
    userEffectsStyles,
    setRerender,
    subContainerRef,
    positioning,
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
    svgMediaInstance.svgMedia.addSvgListener(svgController.handleSvgMessages);

    document.addEventListener("keydown", lowerSvgController.handleKeyDown);

    tableRef.current?.addEventListener(
      "scroll",
      svgController.handleTableScroll,
    );

    return () => {
      document.removeEventListener("keydown", lowerSvgController.handleKeyDown);
      svgMediaInstance.svgMedia.removeSvgListener(
        svgController.handleSvgMessages,
      );
      tableRef.current?.removeEventListener(
        "scroll",
        svgController.handleTableScroll,
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(structuredClone(defaultActivePages));
  }, [settingsActive]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      svgController.handleTableStaticContentMessage,
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        svgController.handleTableStaticContentMessage,
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
        filename={svgMediaInstance.svgMedia.filename}
        kind="svg"
        initState={svgMediaInstance.svgMedia.state}
        rootMedia={svgMediaInstance.instanceSvg}
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
          zValue={10000}
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

                const metadata = {
                  table_id: table_id.current,
                  contentId: svgMediaInstance.svgMedia.svgId,
                  direction: "reupload",
                };

                try {
                  const metaRes = await fetch(
                    staticContentServerBaseUrl + "upload-meta",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(metadata),
                    },
                  );

                  const { uploadId } = await metaRes.json();

                  const formData = new FormData();
                  formData.append("file", file);

                  const xhr = new XMLHttpRequest();
                  xhr.open(
                    "POST",
                    staticContentServerBaseUrl + `upload-file/${uploadId}`,
                    true,
                  );

                  xhr.send(formData);
                } catch (error) {
                  console.error("Error sending metadata:", error);
                }
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
