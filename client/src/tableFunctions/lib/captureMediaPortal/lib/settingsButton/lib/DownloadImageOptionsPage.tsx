import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadImageOptionsTitles,
  downloadImageOptionsArrays,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadImageOptionsPage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const handleDownloadImageOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadImageOptions.active =
        !newActivePages.downloadImageOptions.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (
    option: keyof typeof downloadImageOptionsTitles,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadImageOptions[option].active =
        !newActivePages.downloadImageOptions[option].active;

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
          clickFunction={handleDownloadImageOptionsActive}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleDownloadImageOptionsActive}
        >
          Download options
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col justify-start space-y-1 overflow-y-auto px-2">
        {Object.keys(downloadImageOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className="h-8 w-full"
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof downloadImageOptionsArrays,
              )
            }
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                <div>
                  {
                    downloadImageOptionsTitles[
                      option as keyof typeof downloadImageOptionsArrays
                    ]
                  }
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div>
                    {option === "quality"
                      ? parseFloat(
                          settings.downloadImageOptions[option].value.toFixed(
                            2,
                          ),
                        )
                      : settings.downloadImageOptions[
                          option as keyof typeof downloadImageOptionsArrays
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
