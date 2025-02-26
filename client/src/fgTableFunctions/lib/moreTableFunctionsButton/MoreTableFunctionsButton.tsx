import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import MoreTableFunctionsSection from "../moreTableFunctionsSection/MoreTableFunctionsSection";
import { FgBackground } from "../../../elements/fgBackgroundSelector/lib/typeConstant";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";

export default function MoreTableFunctionsButton({
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
}: {
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
}) {
  const [moreTableFunctionsActive, setMoreTableFunctionsActive] =
    useState(false);
  const moreTableFunctionsButtonRef = useRef<HTMLButtonElement>(null);
  const moreTableFunctionsPanelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (event: PointerEvent) => {
    if (!moreTableFunctionsPanelRef.current?.contains(event.target as Node)) {
      setMoreTableFunctionsActive(false);
    }
  };

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
        className='h-full aspect-square bg-transparent'
        clickFunction={() => setMoreTableFunctionsActive((prev) => !prev)}
        contentFunction={() => {
          return (
            <FgSVG
              src={additionIcon}
              className='flex h-full aspect-square items-center justify-center'
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
            <FgHoverContentStandard content='More table functions' />
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
        />
      )}
    </>
  );
}
