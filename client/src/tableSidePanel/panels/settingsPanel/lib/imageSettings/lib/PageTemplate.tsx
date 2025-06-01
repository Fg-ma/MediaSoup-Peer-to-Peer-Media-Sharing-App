import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function PageTemplate({
  content,
}: {
  content?: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="h-0.5 w-[95%] rounded-full bg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2">
        {content}
      </div>
    </div>
  );
}
