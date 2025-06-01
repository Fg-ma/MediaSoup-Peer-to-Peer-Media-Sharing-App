import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;
const cameraIcon = nginxAssetServerBaseUrl + "svgs/cameraIcon.svg";

export default function CaptureMediaButton({
  captureMediaActive,
  setCaptureMediaActive,
  setMoreTableFunctionsActive,
}: {
  captureMediaActive: boolean;
  setCaptureMediaActive: React.Dispatch<React.SetStateAction<boolean>>;
  setMoreTableFunctionsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleClick = async () => {
    if (captureMediaActive) return;

    setCaptureMediaActive(true);
  };

  return (
    <FgButton
      className="aspect-square h-full"
      clickFunction={handleClick}
      contentFunction={() => (
        <FgSVGElement
          src={cameraIcon}
          className="fill-fg-off-white stroke-fg-off-white"
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content="Capture media" />}
      options={{ hoverTimeoutDuration: 750 }}
      aria-label="Capture media"
    />
  );
}
