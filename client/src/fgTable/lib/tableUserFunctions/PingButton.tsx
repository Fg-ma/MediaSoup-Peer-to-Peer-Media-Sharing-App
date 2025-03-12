import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const pingIcon = nginxAssetServerBaseUrl + "svgs/userFunctions/pingIcon.svg";

export default function PingButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      contentFunction={() => (
        <FgSVG
          src={pingIcon}
          attributes={[
            { key: "width", value: "95%" },
            { key: "height", value: "95%" },
            { key: "fill", value: "black" },
            { key: "stroke", value: "black" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Ping' />}
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750, hoverZValue: 5000000000 }}
    />
  );
}
