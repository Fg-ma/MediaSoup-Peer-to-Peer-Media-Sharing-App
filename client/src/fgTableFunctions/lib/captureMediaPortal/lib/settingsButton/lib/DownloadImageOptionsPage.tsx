import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  downloadImageOptionsTitles,
  downloadImageOptionsArrays,
} from "../../typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon = nginxAssetSeverBaseUrl + "svgs/navigateForward.svg";

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
    option: keyof typeof downloadImageOptionsTitles
  ) => {
    if (option !== "antialiasing") {
      setActivePages((prev) => {
        const newActivePages = { ...prev };

        newActivePages.downloadImageOptions[option].active =
          !newActivePages.downloadImageOptions[option].active;

        return newActivePages;
      });
    } else {
      setSettings((prev) => {
        const newSettings = { ...prev };

        newSettings.downloadImageOptions[option].value =
          !newSettings.downloadImageOptions[option].value;

        return newSettings;
      });
    }
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2 font-K2D'>
      <div className='flex h-6 w-full space-x-1 justify-start'>
        <FgButton
          className='h-full aspect-square'
          contentFunction={() => (
            <FgSVG
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
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleDownloadImageOptionsActive}
        >
          Download options
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'>
        {Object.keys(downloadImageOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className='w-full h-8'
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof downloadImageOptionsArrays
              )
            }
            contentFunction={() => (
              <div
                className={`${
                  option !== "antialiasing"
                    ? "justify-between"
                    : "justify-center"
                } ${
                  option === "antialiasing" &&
                  settings.downloadImageOptions.antialiasing.value
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full space-x-4 px-2 hover:bg-fg-white hover:text-fg-tone-black-1 rounded text-nowrap`}
              >
                <div>
                  {
                    downloadImageOptionsTitles[
                      option as keyof typeof downloadImageOptionsArrays
                    ]
                  }
                </div>
                {option !== "antialiasing" && (
                  <div className='flex space-x-1 items-center justify-center'>
                    <div>
                      {option === "quality"
                        ? parseFloat(
                            settings.downloadImageOptions[option].value.toFixed(
                              2
                            )
                          )
                        : settings.downloadImageOptions[
                            option as keyof typeof downloadImageOptionsArrays
                          ].value}
                    </div>
                    <FgSVG
                      src={navigateForwardIcon}
                      attributes={[
                        { key: "width", value: "1.25rem" },
                        { key: "height", value: "1.25rem" },
                        { key: "fill", value: "#f2f2f2" },
                        { key: "stroke", value: "#f2f2f2" },
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
