import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useSocketContext } from "../../../context/socketContext/SocketContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const swapIcon = nginxAssetServerBaseUrl + "svgs/userFunctions/swapIcon.svg";

export default function SwapSeatsbutton({
  username,
  userPanelRef,
}: {
  username: string;
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { tableSocket } = useSocketContext();

  return (
    <FgButton
      clickFunction={() => {
        tableSocket.current?.swapSeats(username);
      }}
      contentFunction={() => (
        <FgSVGElement
          src={swapIcon}
          className="fill-fg-white stroke-fg-white"
          attributes={[
            { key: "width", value: "95%" },
            { key: "height", value: "95%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content="Swap seats" />}
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
