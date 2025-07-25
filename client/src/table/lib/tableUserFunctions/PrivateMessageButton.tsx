import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const privateMessageIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/privateMessageIcon.svg";

export default function PrivateMessageButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      contentFunction={() => (
        <FgSVGElement
          src={privateMessageIcon}
          className="fill-fg-white stroke-fg-white"
          attributes={[
            { key: "width", value: "95%" },
            { key: "height", value: "95%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content={"Private message"} />}
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
