import React, { useEffect, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import ColorPickerButton from "../colorPickerButton/ColorPickerButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tintIcon = nginxAssetServerBaseUrl + "svgs/visualEffects/tintIcon.svg";
const tintOffIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/tintOffIcon.svg";

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
  const [_, setRerender] = useState(false);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [tintColor.current]);

  return (
    <>
      <FgButton
        className="flex !aspect-square h-full items-center justify-center rounded-full border-2 border-fg-white hover:border-fg-red-light"
        clickFunction={async () => {
          setEffectsDisabled(true);

          if (clickFunctionCallback) await clickFunctionCallback();

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVGElement
              src={streamEffects ? tintOffIcon : tintIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "90%" },
                { key: "height", value: "90%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={<FgHoverContentStandard content="Tint" />}
        scrollingContainerRef={scrollingContainerRef}
        options={{
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
        }}
      />
      <ColorPickerButton
        className="h-full"
        scrollingContainerRef={scrollingContainerRef}
        handleAcceptColorCallback={async () => {
          setEffectsDisabled(true);
          if (acceptColorCallback) await acceptColorCallback();

          setEffectsDisabled(false);
        }}
        defaultColor={tintColor.current}
        externalColorRef={tintColor}
        disabled={effectsDisabled}
      />
    </>
  );
}
