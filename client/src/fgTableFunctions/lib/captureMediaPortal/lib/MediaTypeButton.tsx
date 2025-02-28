import React, { useState } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const moreOptionsIcon = nginxAssetServerBaseUrl + "svgs/moreOptionsIcon.svg";
const moreOptionsOffIcon =
  nginxAssetServerBaseUrl + "svgs/moreOptionsOffIcon.svg";

export default function MediaTypeButton() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
  };

  return (
    <FgButton
      className='h-full aspect-square'
      clickFunction={handleClick}
      contentFunction={() => (
        <FgSVG
          src={clicked ? moreOptionsOffIcon : moreOptionsIcon}
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
