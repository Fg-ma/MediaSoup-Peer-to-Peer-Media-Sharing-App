import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  ActivePages,
  downloadOptionsTitles,
  downloadOptionsArrays,
} from "../../../typeConstant";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadOptionsPage({
  setActivePages,
  svgMediaInstance,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  svgMediaInstance: TableSvgMediaInstance;
}) {
  const handleDownloadOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.active =
        !newActivePages.downloadOptions.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (option: keyof typeof downloadOptionsTitles) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions[option].active =
        !newActivePages.downloadOptions[option].active;

      return newActivePages;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 font-K2D">
      <div className="flex h-6 w-full justify-start space-x-1">
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
          clickFunction={handleDownloadOptionsActive}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleDownloadOptionsActive}
        >
          Download options
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col justify-start space-y-1 overflow-y-auto px-2">
        {Object.keys(downloadOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className="h-8 w-full"
            clickFunction={() =>
              handleOptionSelect(option as keyof typeof downloadOptionsArrays)
            }
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                <div>
                  {
                    downloadOptionsTitles[
                      option as keyof typeof downloadOptionsArrays
                    ]
                  }
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div>
                    {option === "size"
                      ? `${parseFloat(
                          svgMediaInstance.settings.downloadOptions[
                            option
                          ].width.value.toFixed(2),
                        )}x${parseFloat(
                          svgMediaInstance.settings.downloadOptions[
                            option
                          ].height.value.toFixed(2),
                        )}`
                      : svgMediaInstance.settings.downloadOptions[
                          option as keyof typeof downloadOptionsArrays
                        ].value}
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                      { key: "fill", value: "#f2f2f2" },
                      { key: "stroke", value: "#f2f2f2" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
