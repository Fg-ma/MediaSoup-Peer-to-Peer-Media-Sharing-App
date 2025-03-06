import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const addFriendIcon =
  nginxAssetSeverBaseUrl + "svgs/userFunctions/addFriendIcon.svg";
const removeFriendIcon =
  nginxAssetSeverBaseUrl + "svgs/userFunctions/removeFriendIcon.svg";

export default function FriendStatusButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [isFriend, setIsFriend] = useState(false);

  return (
    <FgButton
      clickFunction={() => setIsFriend((prev) => !prev)}
      contentFunction={() => {
        const src = isFriend ? removeFriendIcon : addFriendIcon;

        return (
          <FgSVG
            src={src}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "black" },
              { key: "stroke", value: "black" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={isFriend ? "Remove friend" : "Add friend"}
        />
      }
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750, hoverZValue: 5000000000 }}
    />
  );
}
