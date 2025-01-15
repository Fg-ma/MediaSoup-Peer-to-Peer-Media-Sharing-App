import React, { useState } from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import MoreTableFunctionsSection from "../moreTableFunctionsSection/MoreTableFunctionsSection";
import { FgBackground } from "../../../fgElements/fgBackgroundSelector/lib/typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";

export default function MoreTableFunctionsButton({
  table_id,
  username,
  instance,
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
  table_id: React.MutableRefObject<string>;
  username: React.MutableRefObject<string>;
  instance: React.MutableRefObject<string>;
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

  return (
    <FgButton
      className='h-full aspect-square bg-transparent'
      contentFunction={() => {
        return (
          <FgSVG
            src={additionIcon}
            className='h-full aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#e80110" },
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
      toggleClickContent={
        <MoreTableFunctionsSection
          table_id={table_id}
          username={username}
          instance={instance}
          tableTopRef={tableTopRef}
          mutedAudioRef={mutedAudioRef}
          isAudio={isAudio}
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
      }
      options={{ toggleClickCloseWhenOutside: false }}
    />
  );
}
