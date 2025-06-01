import React, { useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  ActivePages,
  DownloadMimeTypes,
  downloadOptionsArrays,
} from "../../../typeConstant";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function MimeTypePage({
  setActivePages,
  svgMediaInstance,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  svgMediaInstance: TableSvgMediaInstance;
}) {
  const [_, setRerender] = useState(false);
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setMimeType = (mimeType: DownloadMimeTypes) => {
    svgMediaInstance.settings.downloadOptions.mimeType.value = mimeType;
    setRerender((prev) => !prev);
  };

  const handleCloseMimeTypePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.mimeType.active =
        !newActivePages.downloadOptions.mimeType.active;

      return newActivePages;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-between">
        <div className="flex w-full space-x-1">
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
            clickFunction={handleCloseMimeTypePage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseMimeTypePage}
          >
            Mime type
          </div>
        </div>
        <div></div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div
        ref={scrollingContainerRef}
        className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        {downloadOptionsArrays.mimeType.map((mimeType) => (
          <div
            key={mimeType}
            className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              mimeType ===
              svgMediaInstance.settings.downloadOptions.mimeType.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className="flex grow items-center justify-center"
              contentFunction={() => (
                <div className="flex w-full items-start px-2">{mimeType}</div>
              )}
              clickFunction={() => {
                setMimeType(mimeType);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
