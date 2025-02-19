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
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={<FgHoverContentStandard content='Blur' />}
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
