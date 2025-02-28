import React, { useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const blurIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/blurIcon.svg";
const blurOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/blurOffIcon.svg";

export default function BlurButton({
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  streamEffects,
  clickFunctionCallback,
}: {
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  streamEffects: boolean;
  clickFunctionCallback?: () => Promise<void>;
}) {
  const [_, setRerender] = useState(0);

  return (
    <FgButton
      className='flex items-center justify-center h-full !aspect-square border-2 border-fg-white border-opacity-90 rounded-full hover:border-fg-red-light'
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        if (clickFunctionCallback) await clickFunctionCallback();

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={streamEffects ? blurOffIcon : blurIcon}
            className='flex h-full w-full items-center justify-center'
            attributes={[
              { key: "width", value: "90%" },
              { key: "height", value: "90%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={<FgHoverContentStandard content='Blur' />}
      scrollingContainerRef={scrollingContainerRef}
      options={{
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
