import React, { useState } from "react";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const blurIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/blurIcon.svg";
const blurOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/blurOffIcon.svg";

export default function BlurButton({
  videoId,
  handleVideoEffectChange,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  videoId: string;
  handleVideoEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userStreamEffects } = useEffectsContext();

  const [_, setRerender] = useState(0);

  const streamEffects = userStreamEffects.current.video[videoId].video.blur;

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVideoEffectChange("blur");

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
