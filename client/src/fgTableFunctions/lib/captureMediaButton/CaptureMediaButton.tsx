import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
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

    setMoreTableFunctionsActive(false);
  };

  return (
    <FgButton
      className='h-full aspect-square'
      clickFunction={handleClick}
      contentFunction={() => (
        <FgSVG
          src={cameraIcon}
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            { key: "fill", value: "black" },
            { key: "stroke", value: "black" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Capture media' />}
      options={{ hoverTimeoutDuration: 750, hoverZValue: 500000000000 }}
      aria-label='Capture media'
    />
  );
}
