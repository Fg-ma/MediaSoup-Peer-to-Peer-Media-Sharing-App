import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../context/effectsContext/EffectsContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
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
import SvgEditor from "../../elements/svgEditor/SvgEditor";
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
  const { userStreamEffects, userEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

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
    userStreamEffects,
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
    userStreamEffects,
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
      {/* {editing && svgMedia.svg && (
        <SvgEditor
          initSvg={svgMedia.svg}
          closeFunction={() => setEditing(false)}
          confirmFunction={(url, svg, d, blob, name, filters) => {
            console.log(url, svg, d, blob, name, filters);
          }}
        />
      )} */}
    </>
  );
}
