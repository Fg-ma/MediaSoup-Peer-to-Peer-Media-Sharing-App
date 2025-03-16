import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadOptionsTitles,
  downloadOptionsArrays,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadOptionsPage({
  setActivePages,
  settings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
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
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2 font-K2D'>
      <div className='flex h-6 w-full space-x-1 justify-start'>
        <FgButton
          className='h-full aspect-square'
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
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleDownloadOptionsActive}
        >
          Download options
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'>
        {Object.keys(downloadOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className='w-full h-8'
            clickFunction={() =>
              handleOptionSelect(option as keyof typeof downloadOptionsArrays)
            }
            contentFunction={() => (
              <div className='flex justify-between w-full space-x-4 px-2 hover:bg-fg-white hover:text-fg-tone-black-1 rounded text-nowrap'>
                <div>
                  {
                    downloadOptionsTitles[
                      option as keyof typeof downloadOptionsArrays
                    ]
                  }
                </div>
                {option !== "antialiasing" && (
                  <div className='flex space-x-1 items-center justify-center'>
                    <div>
                      {option === "size"
                        ? parseFloat(
                            settings.downloadOptions[option].value.toFixed(2)
                          )
                        : settings.downloadOptions[
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
                )}
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
