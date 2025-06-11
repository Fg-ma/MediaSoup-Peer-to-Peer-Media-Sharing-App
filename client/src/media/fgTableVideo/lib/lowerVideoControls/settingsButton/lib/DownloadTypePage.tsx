import React, { useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import { ActivePages, downloadTypeSelections } from "../../../typeConstant";
import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function DownloadTypePage({
  videoMediaInstance,
  setActivePages,
  setRerender,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setDownloadType = (
    downloadType: keyof typeof downloadTypeSelections,
  ) => {
    videoMediaInstance.current.settings.downloadType.value = downloadType;

    setRerender((prev) => !prev);
  };

  const handleCloseDownloadTypePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.active = !newActivePages.downloadType.active;

      return newActivePages;
    });
  };

  const handleDownloadTypeOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.downloadTypeOptions.active =
        !newActivePages.downloadType.downloadTypeOptions.active;

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
            clickFunction={handleCloseDownloadTypePage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseDownloadTypePage}
          >
            Download
          </div>
        </div>
        {videoMediaInstance.current.settings.downloadType.value === "record" ? (
          <FgButton
            contentFunction={() => (
              <div className="rounded px-2 pt-0.5 font-Josefin text-lg font-bold hover:bg-fg-white hover:text-fg-tone-black-1">
                Options
              </div>
            )}
            clickFunction={handleDownloadTypeOptionsActive}
          />
        ) : (
          <div></div>
        )}
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div
        ref={scrollingContainerRef}
        className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        {Object.entries(downloadTypeSelections).map(([key, lang]) => (
          <div
            key={key}
            className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              key === videoMediaInstance.current.settings.downloadType.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className="flex grow items-center justify-center"
              contentFunction={() => (
                <div className="flex w-full items-start px-2">{lang}</div>
              )}
              clickFunction={() =>
                setDownloadType(key as keyof typeof downloadTypeSelections)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
