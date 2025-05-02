import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../LowerController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const fullScreenIcon = nginxAssetServerBaseUrl + "svgs/fullScreenIcon.svg";
const fullScreenOffIcon =
  nginxAssetServerBaseUrl + "svgs/fullScreenOffIcon.svg";

export default function FullScreenButton({
  lowerController,
  preventLowerLabelsVariables,
  scrollingContainerRef,
}: {
  lowerController: React.MutableRefObject<LowerController>;
  preventLowerLabelsVariables?: boolean[];
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      className="pointer-events-auto flex !aspect-square h-full scale-x-[-1] items-center justify-center"
      clickFunction={() => {
        lowerController.current.handleFullScreen();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = active ? fullScreenOffIcon : fullScreenIcon;

        return (
          <FgSVGElement
            src={iconSrc}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !preventLowerLabelsVariables?.some(Boolean) ? (
          <FgHoverContentStandard content="Full screen (f)" style="light" />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
    />
  );
}
