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

  const svgMedia = userMedia.current.svg.instances[svgInstanceId];

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
    svgInstanceId,
    svgMedia,
    svgContainerRef,
    shiftPressed,
    controlPressed,
    setSvgEffectsActive,
    userEffects,
    userEffectsStyles,
    setSettingsActive,
    settings,
    tableStaticContentSocket,
    setSettings,
    setEditing
  );

  const svgController = new SvgController(
    svgInstanceId,
    svgMedia,
    setSettingsActive,
    userEffects,
    userEffectsStyles,
    setRerender
  );

  useEffect(() => {
    if (svgMedia.instanceSvg) {
      subContainerRef.current?.appendChild(svgMedia.instanceSvg);
      positioning.current.scale = {
        x: svgMedia.aspect
          ? positioning.current.scale.y * svgMedia.aspect
          : positioning.current.scale.x,
        y: positioning.current.scale.y,
      };
    }
    svgMedia.addDownloadCompleteListener(() => {
      if (svgMedia.instanceSvg) {
        const allSvgs = subContainerRef.current?.querySelectorAll("svg");

        if (allSvgs) {
          allSvgs.forEach((svgElement) => {
            svgElement.remove();
          });
        }

        subContainerRef.current?.appendChild(svgMedia.instanceSvg);
        positioning.current.scale = {
          x: svgMedia.aspect
            ? positioning.current.scale.y * svgMedia.aspect
            : positioning.current.scale.x,
          y: positioning.current.scale.y,
        };
      }
    });

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
        mediaId={svgMedia.svgId}
        mediaInstanceId={svgInstanceId}
        filename={svgMedia.filename}
        kind='svg'
        rootMedia={svgMedia.svg}
        bundleRef={bundleRef}
        backgroundMedia={settings.background.value}
        className='svg-container'
        popupElements={[
          svgEffectsActive ? (
            <SvgEffectsSection
              svgInstanceId={svgInstanceId}
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
      {editing && svgMedia.svg && (
        <FgPortal
          type='staticTopDomain'
          top={0}
          left={0}
          zValue={10000}
          className='flex w-full h-full bg-fg-tone-black-1 bg-opacity-45 items-center justify-center'
          content={
            <MethodSvgEditor
              editing={editing}
              initialSVGString={() => {
                if (svgMedia.svg) {
                  // Create a deep clone of the original svg element
                  const clonedSVG = svgMedia.svg.cloneNode(true) as HTMLElement;

                  // Modify the clone
                  clonedSVG.setAttribute("width", "100");
                  clonedSVG.setAttribute("height", "");

                  // Serialize the cloned SVG to a string
                  return new XMLSerializer().serializeToString(clonedSVG);
                }
              }}
              finishCallback={(svg) => {
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

                const file = new File([blob], svgMedia.filename, {
                  type: "image/svg+xml",
                });

                // Prepare FormData
                const formData = new FormData();
                formData.append("file", file);

                const url = `https://localhost:8045/upload/${table_id.current}/${svgMedia.svgId}/undefined/reupload/true`;

                try {
                  const xhr = new XMLHttpRequest();
                  xhr.open("POST", url, true);
                  xhr.send(formData);
                } catch (error) {
                  console.error("Error uploading file:", error);
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
