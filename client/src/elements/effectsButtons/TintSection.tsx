import React from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import ColorPickerButton from "../colorPickerButton/ColorPickerButton";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tintIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/tintIcon.svg";
const tintOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/tintOffIcon.svg";

export default function TintSection({
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  streamEffects,
  clickFunctionCallback,
  acceptColorCallback,
}: {
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  streamEffects: boolean;
  clickFunctionCallback?: () => Promise<void>;
  acceptColorCallback?: () => Promise<void>;
}) {
  return (
    <>
      <FgButton
        className='flex items-center justify-center h-full !aspect-square border-2 border-fg-white border-opacity-90 rounded-full hover:border-fg-red-light'
        clickFunction={async () => {
          setEffectsDisabled(true);

          if (clickFunctionCallback) await clickFunctionCallback();

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? tintOffIcon : tintIcon}
              className='flex h-full w-full items-center justify-center'
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={<FgHoverContentStandard content='Tint' />}
        scrollingContainerRef={scrollingContainerRef}
        options={{
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
        }}
      />
      <ColorPickerButton
        className='h-full'
        scrollingContainerRef={scrollingContainerRef}
        handleAcceptColorCallback={async () => {
          setEffectsDisabled(true);
          if (acceptColorCallback) await acceptColorCallback();

          setEffectsDisabled(false);
        }}
        externalColorRef={tintColor}
        disabled={effectsDisabled}
      />
    </>
  );
}
