import React, { useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function ClearAllButton({
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  clickFunctionCallback,
}: {
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  clickFunctionCallback?: () => Promise<void>;
}) {
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    if (clickFunctionCallback) await clickFunctionCallback();

    setEffectsDisabled(false);
  };

  return (
    <FgButton
      className='h-full !aspect-square border-2 border-fg-white border-opacity-90 rounded-full hover:border-fg-red-light'
      clickFunction={clickFunction}
      contentFunction={() => (
        <FgSVG
          src={closeIcon}
          className='flex h-full w-full items-center justify-center'
          attributes={[
            { key: "width", value: "50%" },
            { key: "height", value: "50%" },
            { key: "fill", value: "#f2f2f2" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Clear' />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      options={{
        hoverZValue: 500000000001,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
