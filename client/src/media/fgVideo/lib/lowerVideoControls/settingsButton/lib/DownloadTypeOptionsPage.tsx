import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  downloadTypeOptionsTitles,
  downloadTypeOptionsArrays,
} from "../../../typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon = nginxAssetSeverBaseUrl + "svgs/navigateForward.svg";

export default function DownloadTypeOptionsPage({
  setActivePages,
  settings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
}) {
  const handleDownloadTypeOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.downloadTypeOptions.active =
        !newActivePages.downloadType.downloadTypeOptions.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (
    option: keyof typeof downloadTypeOptionsTitles
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.downloadTypeOptions[option].active =
        !newActivePages.downloadType.downloadTypeOptions[option].active;

      return newActivePages;
    });
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
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          )}
          clickFunction={handleDownloadTypeOptionsActive}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleDownloadTypeOptionsActive}
        >
          Options
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'>
        {Object.keys(downloadTypeOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className='w-full h-8'
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof downloadTypeOptionsArrays
              )
            }
            contentFunction={() => (
              <div className='flex w-full justify-between space-x-4 px-2 bg-opacity-75 hover:bg-fg-white hover:text-fg-tone-black-1 rounded text-nowrap'>
                <div>
                  {
                    downloadTypeOptionsTitles[
                      option as keyof typeof downloadTypeOptionsArrays
                    ]
                  }
                </div>
                <div className='flex space-x-1 items-center justify-center'>
                  <div>
                    {
                      settings.downloadType.downloadTypeOptions[
                        option as keyof typeof downloadTypeOptionsArrays
                      ].value
                    }
                  </div>
                  <FgSVG
                    src={navigateForwardIcon}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                      { key: "fill", value: "white" },
                      { key: "stroke", value: "white" },
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
