import React from "react";
import FgButton from "../../elements/fgButton/FgButton";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import GuideItem from "./GuideItem";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function Guide({
  setGuideOpen,
}: {
  setGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="absolute right-0 top-0 flex h-screen w-80 flex-col items-center justify-start space-y-6 overflow-y-auto overflow-x-hidden bg-fg-tone-black-4 p-[2%]">
      <div className="relative flex w-full flex-col items-center justify-center space-y-[1%] font-Josefin text-3xl text-fg-white">
        Guide
        <div className="h-1 min-h-1 w-[95%] rounded-[2px] bg-fg-red"></div>
        <FgButton
          className="absolute bottom-4 right-[2.5%] aspect-square h-6"
          contentFunction={() => (
            <FgSVGElement
              className="fill-fg-white stroke-fg-white"
              src={closeIcon}
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          clickFunction={() => setGuideOpen((prev) => !prev)}
        />
      </div>
      <GuideItem id="creditPage_3DModels" title="3D Models" />
      <GuideItem id="creditPage_littleBuddies" title="Little buddies" />
    </div>
  );
}
