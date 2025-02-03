import React, { useRef, useState } from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import MoreTableFunctionsSection from "../moreTableFunctionsSection/MoreTableFunctionsSection";
import { FgBackground } from "../../../fgElements/fgBackgroundSelector/lib/typeConstant";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

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
              className='h-full aspect-square'
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
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
