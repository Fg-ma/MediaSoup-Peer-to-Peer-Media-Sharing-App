import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function PageTemplate({
  content,
  pageTitle,
  backFunction,
}: {
  content?: React.ReactNode;
  pageTitle?: string;
  backFunction?: (event: React.MouseEvent) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div
        className={`flex h-6 w-full items-start ${
          pageTitle ? "space-x-1" : ""
        }`}
      >
        <FgButton
          className="aspect-square h-full"
          contentFunction={() => (
            <FgSVGElement
              src={navigateBackIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          )}
          // @ts-expect-error: trival non overlap of PointerEvent and React.PointerEvent
          pointerUpFunction={backFunction}
        />
        {pageTitle && (
          <div
            className="cursor-pointer pr-2 pt-0.5 font-Josefin text-lg font-bold"
            onClick={backFunction}
          >
            {pageTitle}
          </div>
        )}
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2">
        {content}
      </div>
    </div>
  );
}
