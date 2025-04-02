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

export default function FgSvg({
  svgId,
  bundleRef,
  tableRef,
}: {
  svgId: string;
  bundleRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { userEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { table_id } = useUserInfoContext();

  const [editing, setEditing] = useState(false);

  const svgMedia = userMedia.current.svg[svgId];

  const [svgEffectsActive, setSvgEffectsActive] = useState(false);

  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>(svgMedia.initPositioning);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const subContainerRef = useRef<HTMLDivElement>(null);
  const rightLowerSvgControlsRef = useRef<HTMLDivElement>(null);

  const shiftPressed = useRef(false);
  const controlPressed = useRef(false);

  const [_, setRerender] = useState(false);

  const [settingsActive, setSettingsActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(
    structuredClone(defaultSettings)
  );
  const [activePages, setActivePages] = useState<ActivePages>(
    structuredClone(defaultActivePages)
  );

  const lowerSvgController = new LowerSvgController(
    svgId,
    svgMedia,
    svgContainerRef,
    shiftPressed,
    controlPressed,
    setSvgEffectsActive,
    userEffects,
    userEffectsStyles,
    userMedia,
    setSettingsActive,
    settings,
    setRerender,
    tableStaticContentSocket,
    setSettings,
    setEditing
  );

  const svgController = new SvgController(
    svgId,
    svgMedia,
    setSettingsActive,
    userEffects,
    userEffectsStyles,
    setRerender
  );

  useEffect(() => {
    if (svgMedia.svg) {
      subContainerRef.current?.appendChild(svgMedia.svg);
    } else {
      svgMedia.addDownloadCompleteListener(() => {
        if (svgMedia.svg) subContainerRef.current?.appendChild(svgMedia.svg);
      });
    }

    document.addEventListener("keydown", lowerSvgController.handleKeyDown);

    document.addEventListener("keyup", lowerSvgController.handleKeyUp);

    tableRef.current?.addEventListener(
      "scroll",
      svgController.handleTableScroll
    );

    return () => {
      document.removeEventListener("keydown", lowerSvgController.handleKeyDown);
      document.removeEventListener("keyup", lowerSvgController.handleKeyUp);
      tableRef.current?.removeEventListener(
        "scroll",
        svgController.handleTableScroll
      );
    };
  }, []);

  useEffect(() => {
    setActivePages(structuredClone(defaultActivePages));
  }, [settingsActive]);

  useEffect(() => {
    tableStaticContentSocket.current?.addMessageListener(
      svgController.handleTableStaticContentMessage
    );

    return () =>
      tableStaticContentSocket.current?.removeMessageListener(
        svgController.handleTableStaticContentMessage
      );
  }, [tableStaticContentSocket.current]);

  return (
    <>
      <FgMediaContainer
        mediaId={svgId}
        filename={svgMedia.filename}
        kind='svg'
        rootMedia={svgMedia.svg}
        bundleRef={bundleRef}
        backgroundMedia={settings.background.value}
        className='svg-container'
        popupElements={[
          svgEffectsActive ? (
            <SvgEffectsSection
              svgId={svgId}
              svgMedia={svgMedia}
              lowerSvgController={lowerSvgController}
              svgContainerRef={svgContainerRef}
            />
          ) : null,
        ]}
        rightLowerControls={[
          <SettingsButton
            svgMedia={svgMedia}
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
      <FgPortal
        type='staticTopDomain'
        top={0}
        left={0}
        zValue={10000}
        className={`${
          editing && svgMedia.svg ? "visible" : "hidden pointer-events-none"
        } flex w-full h-full bg-fg-tone-black-1 bg-opacity-45 items-center justify-center`}
        content={
          <MethodSvgEditor
            initialSVGString={() => {
              if (svgMedia.svg) {
                svgMedia.svg.setAttribute("width", "100");
                svgMedia.svg.setAttribute("height", "100");
                return new XMLSerializer().serializeToString(svgMedia.svg);
              }
            }}
            finishCallback={(svg) => {
              setEditing(false);

              const allSvgs = subContainerRef.current?.querySelectorAll("svg");

              if (allSvgs) {
                allSvgs.forEach((svgElement) => {
                  svgElement.remove();
                });
              }

              svgMedia.setSvgfromString(svg);

              if (svgMedia.svg) {
                if (!svgMedia.svg.getAttribute("viewBox")) {
                  const width = svgMedia.svg.width.baseVal.value;
                  const height = svgMedia.svg.height.baseVal.value;

                  svgMedia.svg.setAttribute(
                    "viewBox",
                    `0 0 ${width} ${height}`
                  );
                }
                svgMedia.svg.style.width = "100%";
                svgMedia.svg.style.height = "100%";
                subContainerRef.current?.appendChild(svgMedia.svg);
              }

              const handleFileUpload = async () => {
                if (!svgMedia.svg) {
                  return;
                }

                // Convert the SVG element to a Blob
                const svgElement = svgMedia.svg;
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgElement);
                const blob = new Blob([svgString], { type: "image/svg+xml" });

                const file = new File([blob], svgMedia.filename.slice(0, -4), {
                  type: "image/svg+xml",
                });

                // Prepare FormData
                const formData = new FormData();
                formData.append("file", file);

                const url = `https://localhost:8045/upload/${table_id.current}/${svgId}/true`;

                try {
                  const xhr = new XMLHttpRequest();
                  xhr.open("POST", url, true);
                  xhr.send(formData);
                } catch (error) {
                  console.error("Error uploading file:", error);
                }
              };

              if (svgMedia.svg) handleFileUpload();
            }}
            cancelCallback={() => {
              setEditing(false);
            }}
          />
        }
        options={{ animate: false }}
      />
    </>
  );
}
