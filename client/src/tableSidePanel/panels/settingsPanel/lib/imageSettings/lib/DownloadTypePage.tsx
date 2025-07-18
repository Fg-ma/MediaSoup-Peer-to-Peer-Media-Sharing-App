import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import DownloadTypeOptionsPage from "./DownloadTypeOptionsPage";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { downloadTypeSelections } from "../../../../../../media/fgTableImage/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypePage({
  imageMediaInstance,
}: {
  imageMediaInstance: React.MutableRefObject<TableImageMediaInstance>;
}) {
  const [_, setRerender] = useState(false);
  const [downloadTypeOptionsActive, setDownloadTypeOptionsActive] =
    useState(false);

  const setDownloadType = (
    downloadType: keyof typeof downloadTypeSelections,
  ) => {
    imageMediaInstance.current.settings.downloadType.value = downloadType;

    imageMediaInstance.current.settingsChanged();

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      {Object.entries(downloadTypeSelections).map(([key, type]) => (
        <>
          <FgButton
            key={key}
            style={{ width: "calc(100% - 1rem)" }}
            className={`flex items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              key === imageMediaInstance.current.settings.downloadType.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
            contentFunction={() => (
              <div className="flex w-full items-start px-2">{type}</div>
            )}
            clickFunction={() =>
              setDownloadType(key as keyof typeof downloadTypeSelections)
            }
          />
          {((key === "record" &&
            imageMediaInstance.current.settings.downloadType.value ===
              "record") ||
            (key === "snapShot" &&
              imageMediaInstance.current.settings.downloadType.value ===
                "snapShot")) && (
            <>
              <FgButton
                className="h-7"
                style={{ width: "calc(100% - 1rem)" }}
                contentFunction={() => (
                  <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                    <FgSVGElement
                      src={navigateForward}
                      className={`${downloadTypeOptionsActive ? "-scale-x-100" : ""} mr-2 flex aspect-square h-[80%] rotate-90 items-center justify-center`}
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                      ]}
                    />
                    <div className="truncate">
                      {imageMediaInstance.current.settings.downloadType
                        .value === "snapShot"
                        ? "Snap shot options"
                        : "Recording options"}
                    </div>
                  </div>
                )}
                clickFunction={() =>
                  setDownloadTypeOptionsActive((prev) => !prev)
                }
                hoverContent={
                  <FgHoverContentStandard
                    content={
                      downloadTypeOptionsActive
                        ? "Close options"
                        : "Open options"
                    }
                    style="light"
                  />
                }
                options={{
                  hoverSpacing: 4,
                  hoverTimeoutDuration: 3500,
                  hoverType: "above",
                }}
              />
              {downloadTypeOptionsActive && (
                <DownloadTypeOptionsPage
                  imageMediaInstance={imageMediaInstance}
                />
              )}
            </>
          )}
        </>
      ))}
    </>
  );
}
