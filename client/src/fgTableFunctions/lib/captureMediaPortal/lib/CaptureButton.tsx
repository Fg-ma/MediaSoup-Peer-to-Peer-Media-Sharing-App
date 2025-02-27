import React, { useState } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const recordOffIcon = nginxAssetServerBaseUrl + "svgs/recordOffIcon.svg";

export default function CaptureButton() {
  const [clicked, setClicked] = useState(false);

  const handleCapture = () => {
    setClicked(true);

    setTimeout(() => {
      setClicked(false);
    }, 250);
  };

  return (
    <FgButton
      className='h-full aspect-square'
      clickFunction={handleCapture}
      contentFunction={() => (
        <FgSVG
          src={recordOffIcon}
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            clicked
              ? {
                  key: "fill",
                  value: "#d40213",
                  id: "buttonInside",
                }
              : {
                  key: "fill",
                  value: "#f2f2f2",
                  id: "buttonInside",
                },
          ]}
        />
      )}
    />
  );
}
