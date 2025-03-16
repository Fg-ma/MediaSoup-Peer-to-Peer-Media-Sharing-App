import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadOptionsArrays,
} from "../../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function SizePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setSize = (size: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadOptions.size.value = size;

      return newSettings;
    });
  };

  const handleCloseSizePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.size.active =
        !newActivePages.downloadOptions.size.active;

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
            clickFunction={handleCloseSizePage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseSizePage}
          >
            Size
          </div>
        </div>
        <div></div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        <FgSlider
          className='h-10'
          externalValue={settings.downloadOptions.size.value}
          externalStyleValue={settings.downloadOptions.size.value}
          onValueChange={(value) => {
            setSize(value.value);
          }}
          options={{
            initValue: settings.downloadOptions.size.value,
            ticks: 7,
            rangeMax: 32768,
            rangeMin: 1,
            orientation: "horizontal",
            tickLabels: false,
            precision: 0,
            snapToWholeNum: true,
          }}
        />
        {downloadOptionsArrays.size.map((size) => (
          <div
            key={size}
            className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
              parseInt(size) === settings.downloadOptions.size.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className='flex items-center justify-center grow'
              contentFunction={() => (
                <div className='flex w-full bg-opacity-75 px-2 items-start'>
                  {size}
                </div>
              )}
              clickFunction={() => {
                setSize(parseInt(size));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
