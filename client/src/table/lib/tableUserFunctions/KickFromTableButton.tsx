import React from "react";
import { useSocketContext } from "../../../context/socketContext/SocketContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const kickIcon = nginxAssetServerBaseUrl + "svgs/userFunctions/kickIcon.svg";

export default function KickFromTableButton({
  username,
  userPanelRef,
}: {
  username: string;
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { tableSocket } = useSocketContext();

  return (
    <FgButton
      clickFunction={() => tableSocket.current?.kickFromTable(username)}
      contentFunction={() => (
        <FgSVGElement
          src={kickIcon}
          attributes={[
            { key: "width", value: "95%" },
            { key: "height", value: "95%" },
            { key: "fill", value: "black" },
            { key: "stroke", value: "black" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content="Kick from table" />}
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
