import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadVideoOptionsTitles,
  downloadVideoOptionsArrays,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function DownloadsVideoOptionsPage({
  setActivePages,
  settings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
}) {
  const handleDownloadVideoOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadVideoOptions.active =
        !newActivePages.downloadVideoOptions.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (
    option: keyof typeof downloadVideoOptionsTitles
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadVideoOptions[option].active =
        !newActivePages.downloadVideoOptions[option].active;

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
          clickFunction={handleDownloadVideoOptionsActive}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleDownloadVideoOptionsActive}
        >
          Download options
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'>
        {Object.keys(downloadVideoOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className='w-full h-8'
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof downloadVideoOptionsArrays
              )
            }
            contentFunction={() => (
              <div className='flex w-full justify-between space-x-4 px-2 bg-opacity-75 hover:bg-fg-white hover:text-fg-tone-black-1 rounded text-nowrap'>
                <div>
                  {
                    downloadVideoOptionsTitles[
                      option as keyof typeof downloadVideoOptionsArrays
                    ]
                  }
                </div>
                <div className='flex space-x-1 items-center justify-center'>
                  <div>
                    {option === "bitRate"
                      ? settings.downloadVideoOptions[option].value ===
                        "default"
                        ? settings.downloadVideoOptions[option].value
                        : `${parseFloat(
                            settings.downloadVideoOptions[option].value.toFixed(
                              2
                            )
                          )} Mbps`
                      : settings.downloadVideoOptions[
                          option as keyof typeof downloadVideoOptionsArrays
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
