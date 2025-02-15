import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  downloadTypeSelections,
} from "../../../typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export default function DownloadTypePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setDownloadType = (
    downloadType: keyof typeof downloadTypeSelections
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadType.value = downloadType;

      return newSettings;
    });
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
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div className='flex h-6 w-full justify-between'>
        <div className='flex w-full space-x-1'>
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
            clickFunction={handleCloseDownloadTypePage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseDownloadTypePage}
          >
            Download
          </div>
        </div>
        {settings.downloadType.value === "record" ? (
          <FgButton
            contentFunction={() => (
              <div className='px-2 bg-opacity-75 hover:bg-gray-400 rounded font-Josefin text-lg font-bold pt-0.5'>
                Options
              </div>
            )}
            clickFunction={handleDownloadTypeOptionsActive}
          />
        ) : (
          <div></div>
        )}
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        {Object.entries(downloadTypeSelections).map(([key, lang]) => (
          <div
            key={key}
            className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center ${
              key === settings.downloadType.value
                ? "bg-gray-400"
                : "hover:bg-gray-400"
            }`}
          >
            <FgButton
              className='flex items-center justify-center grow'
              contentFunction={() => (
                <div className='flex w-full bg-opacity-75 px-2 items-start'>
                  {lang}
                </div>
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
