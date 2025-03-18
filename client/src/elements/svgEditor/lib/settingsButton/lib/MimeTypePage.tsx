import React, { useRef } from "react";
import FgButton from "../../../../fgButton/FgButton";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  DownloadMimeTypes,
  downloadOptionsArrays,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function MimeTypePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setMimeType = (mimeType: DownloadMimeTypes) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadOptions.mimeType.value = mimeType;

      return newSettings;
    });
  };

  const handleCloseMimeTypePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.mimeType.active =
        !newActivePages.downloadOptions.mimeType.active;

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
            clickFunction={handleCloseMimeTypePage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseMimeTypePage}
          >
            Mime type
          </div>
        </div>
        <div></div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        {downloadOptionsArrays.mimeType.map((mimeType) => (
          <div
            key={mimeType}
            className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
              mimeType === settings.downloadOptions.mimeType.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className='flex items-center justify-center grow'
              contentFunction={() => (
                <div className='flex w-full bg-opacity-75 px-2 items-start'>
                  {mimeType}
                </div>
              )}
              clickFunction={() => {
                setMimeType(mimeType);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
