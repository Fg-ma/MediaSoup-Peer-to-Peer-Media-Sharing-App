import React, { useEffect, useRef } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import MoreTableFunctionsSection from "../moreTableFunctionsSection/MoreTableFunctionsSection";
import { FgBackground } from "../../../elements/fgBackgroundSelector/lib/typeConstant";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";

export default function MoreTableFunctionsButton({
  moreTableFunctionsActive,
  setMoreTableFunctionsActive,
  tableTopRef,
  mutedAudioRef,
  isAudio,
  gridActive,
  setGridActive,
  gridSize,
  setGridSize,
  audioEffectsActive,
  setAudioEffectsActive,
  tableBackground,
  externalBackgroundChange,
  handleExternalMute,
  captureMediaActive,
  setCaptureMediaActive,
  tabledActive,
  setTabledActive,
  tableSidePanelActive,
  setTableSidePanelActive,
  sidePanelPosition,
  setSidePanelPosition,
}: {
  moreTableFunctionsActive: boolean;
  setMoreTableFunctionsActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableTopRef: React.RefObject<HTMLDivElement>;
  mutedAudioRef: React.MutableRefObject<boolean>;
  isAudio: React.MutableRefObject<boolean>;
  gridActive: boolean;
  setGridActive: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: {
    rows: number;
    cols: number;
  };
  setGridSize: React.Dispatch<
    React.SetStateAction<{
      rows: number;
      cols: number;
    }>
  >;
  audioEffectsActive: boolean;
  setAudioEffectsActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableBackground: FgBackground | undefined;
  externalBackgroundChange: React.MutableRefObject<boolean>;
  handleExternalMute: () => void;
  captureMediaActive: boolean;
  setCaptureMediaActive: React.Dispatch<React.SetStateAction<boolean>>;
  tabledActive: boolean;
  setTabledActive: React.Dispatch<React.SetStateAction<boolean>>;
  tableSidePanelActive: boolean;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  sidePanelPosition: "left" | "right";
  setSidePanelPosition: React.Dispatch<React.SetStateAction<"left" | "right">>;
}) {
  const moreTableFunctionsButtonRef = useRef<HTMLButtonElement>(null);
  const moreTableFunctionsPanelRef = useRef<HTMLDivElement>(null);
  const gamesSectionRef = useRef<HTMLDivElement>(null);
  const tableBackgroundSectionRef = useRef<HTMLDivElement>(null);
  const gridSizeSectionRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (event: PointerEvent) => {
    if (
      !moreTableFunctionsPanelRef.current?.contains(event.target as Node) &&
      !moreTableFunctionsButtonRef.current?.contains(event.target as Node) &&
      !gamesSectionRef.current?.contains(event.target as Node) &&
      !tableBackgroundSectionRef.current?.contains(event.target as Node) &&
      !gridSizeSectionRef.current?.contains(event.target as Node)
    ) {
      setMoreTableFunctionsActive(false);
    }
  };

  useEffect(() => {
    if (tabledActive) {
      setMoreTableFunctionsActive(false);
    }
  }, [tabledActive]);

  useEffect(() => {
    if (moreTableFunctionsActive) {
      document.addEventListener("pointerdown", handlePointerDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }
  }, [moreTableFunctionsActive]);

  return (
    <>
      <FgButton
        externalRef={moreTableFunctionsButtonRef}
        className="aspect-square h-full bg-transparent"
        clickFunction={() => setMoreTableFunctionsActive((prev) => !prev)}
        contentFunction={() => {
          return (
            <FgSVGElement
              src={additionIcon}
              className="flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "75%" },
                { key: "height", value: "75%" },
                { key: "fill", value: "#e80110" },
                { key: "stroke", value: "#e80110" },
              ]}
              style={{
                transition: "transform 0.1s ease",
                ...(moreTableFunctionsActive
                  ? { transform: "rotate(45deg)" }
                  : {}),
              }}
            />
          );
        }}
        setExternalClickToggleState={setMoreTableFunctionsActive}
        hoverContent={
          !moreTableFunctionsActive ? (
            <FgHoverContentStandard content="More table functions" />
          ) : undefined
        }
        options={{ hoverTimeoutDuration: 100 }}
        aria-label={"More table functions"}
      />
      {moreTableFunctionsActive && (
        <MoreTableFunctionsSection
          tableTopRef={tableTopRef}
          moreTableFunctionsButtonRef={moreTableFunctionsButtonRef}
          moreTableFunctionsPanelRef={moreTableFunctionsPanelRef}
          mutedAudioRef={mutedAudioRef}
          isAudio={isAudio}
          setMoreTableFunctionsActive={setMoreTableFunctionsActive}
          gridActive={gridActive}
          setGridActive={setGridActive}
          gridSize={gridSize}
          setGridSize={setGridSize}
          audioEffectsActive={audioEffectsActive}
          setAudioEffectsActive={setAudioEffectsActive}
          tableBackground={tableBackground}
          externalBackgroundChange={externalBackgroundChange}
          handleExternalMute={handleExternalMute}
          captureMediaActive={captureMediaActive}
          setCaptureMediaActive={setCaptureMediaActive}
          gamesSectionRef={gamesSectionRef}
          tableBackgroundSectionRef={tableBackgroundSectionRef}
          tabledActive={tabledActive}
          setTabledActive={setTabledActive}
          gridSizeSectionRef={gridSizeSectionRef}
          tableSidePanelActive={tableSidePanelActive}
          setTableSidePanelActive={setTableSidePanelActive}
          sidePanelPosition={sidePanelPosition}
          setSidePanelPosition={setSidePanelPosition}
        />
      )}
    </>
  );
}
