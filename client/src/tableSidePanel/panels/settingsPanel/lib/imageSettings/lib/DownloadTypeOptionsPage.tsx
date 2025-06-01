import React, { useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import {
  downloadTypeOptionsArrays,
  downloadTypeOptionsTitles,
} from "./typeConstant";
import PageTemplate from "./PageTemplate";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypeOptionsPage({
  imageMediaInstance,
}: {
  imageMediaInstance: React.MutableRefObject<TableImageMediaInstance>;
}) {
  const [_, setRerender] = useState(false);
  const [fpsActive, setFpsActive] = useState(false);
  const [mimeTypeActive, setMimeTypeActive] = useState(false);

  return (
    <>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
      <FgButton
        className="h-8 w-full"
        clickFunction={() => setFpsActive((prev) => !prev)}
        contentFunction={() => (
          <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>FPS</div>
            <div className="flex items-center justify-center space-x-1">
              <div>
                {
                  imageMediaInstance.current.settings.downloadType
                    .downloadTypeOptions.fps.value
                }
              </div>
              <FgSVGElement
                src={navigateForwardIcon}
                attributes={[
                  { key: "width", value: "1.25rem" },
                  { key: "height", value: "1.25rem" },
                ]}
              />
            </div>
          </div>
        )}
      />
      {fpsActive && (
        <>
          <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
          {downloadTypeOptionsArrays.fps.map((type) => (
            <FgButton
              key={type}
              className={`w-full min-w-32 rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                type ===
                imageMediaInstance.current.settings.downloadType
                  .downloadTypeOptions.fps.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
              contentFunction={() => (
                <div className="flex items-start justify-start">{type}</div>
              )}
              clickFunction={() => {
                imageMediaInstance.current.settings.downloadType.downloadTypeOptions.fps.value =
                  type;

                setRerender((prev) => !prev);
              }}
            />
          ))}
        </>
      )}
      <FgButton
        className="h-8 w-full"
        clickFunction={() => setMimeTypeActive((prev) => !prev)}
        contentFunction={() => (
          <div className="flex w-full justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div>Mime type</div>
            <div className="flex items-center justify-center space-x-1">
              <div>
                {
                  imageMediaInstance.current.settings.downloadType
                    .downloadTypeOptions.mimeType.value
                }
              </div>
              <FgSVGElement
                src={navigateForwardIcon}
                attributes={[
                  { key: "width", value: "1.25rem" },
                  { key: "height", value: "1.25rem" },
                ]}
              />
            </div>
          </div>
        )}
      />
      {mimeTypeActive && (
        <>
          <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
          {downloadTypeOptionsArrays.mimeType.map((type) => (
            <FgButton
              key={type}
              className={`w-full min-w-32 rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                type ===
                imageMediaInstance.current.settings.downloadType
                  .downloadTypeOptions.mimeType.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
              contentFunction={() => (
                <div className="flex items-start justify-start">{type}</div>
              )}
              clickFunction={() => {
                imageMediaInstance.current.settings.downloadType.downloadTypeOptions.mimeType.value =
                  type;

                setRerender((prev) => !prev);
              }}
            />
          ))}
        </>
      )}
    </>
  );
}
