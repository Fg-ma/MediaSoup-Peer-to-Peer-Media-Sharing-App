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
    <div className='flex w-max items-center justify-center'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);

          if (clickFunctionCallback) await clickFunctionCallback();

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? tintOffIcon : tintIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={<FgHoverContentStandard content='Tint' />}
        scrollingContainerRef={scrollingContainerRef}
        className='flex items-center justify-center min-w-10 w-10 aspect-square'
        options={{
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
        }}
      />
      <ColorPickerButton
        className='min-w-8 w-8 mx-1'
        scrollingContainerRef={scrollingContainerRef}
        handleAcceptColorCallback={async () => {
          setEffectsDisabled(true);
          if (acceptColorCallback) await acceptColorCallback();

          setEffectsDisabled(false);
        }}
        externalColorRef={tintColor}
        disabled={effectsDisabled}
      />
    </div>
  );
}
