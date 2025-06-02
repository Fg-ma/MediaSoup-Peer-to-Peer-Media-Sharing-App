import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const addFriendIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/addFriendIcon.svg";
const removeFriendIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/removeFriendIcon.svg";

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
          <FgSVGElement
            src={src}
            className="fill-fg-white stroke-fg-white"
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
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
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
