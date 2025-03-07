import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export const bitRateSelections = [
  "default",
  "0.25",
  "0.5",
  "0.75",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "4",
  "5",
];

export default function BitRatePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setBitRate = (bitRate: number | "default") => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadVideoOptions.bitRate.value = bitRate;

      return newSettings;
    });
  };

  const handleCloseBitRatePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadVideoOptions.bitRate.active =
        !newActivePages.downloadVideoOptions.bitRate.active;

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
                  { key: "fill", value: "#f2f2f2" },
                  { key: "stroke", value: "#f2f2f2" },
                ]}
              />
            )}
            clickFunction={handleCloseBitRatePage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseBitRatePage}
          >
            Bite rate
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
          externalValue={
            settings.downloadVideoOptions.bitRate.value !== "default"
              ? settings.downloadVideoOptions.bitRate.value
              : 0
          }
          externalStyleValue={
            settings.downloadVideoOptions.bitRate.value !== "default"
              ? settings.downloadVideoOptions.bitRate.value
              : 0
          }
          onValueChange={(value) => {
            setBitRate(value.value);
          }}
          options={{
            initValue:
              settings.downloadVideoOptions.bitRate.value !== "default"
                ? settings.downloadVideoOptions.bitRate.value
                : 0,
            ticks: 11,
            rangeMax: 10,
            rangeMin: 0,
            snapToWholeNum: false,
            orientation: "horizontal",
            tickLabels: false,
            precision: 2,
          }}
        />
        {Object.entries(bitRateSelections)
          .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
          .map(([key, bitRate]) => (
            <div
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseFloat(bitRate) ===
                settings.downloadVideoOptions.bitRate.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className='flex items-center justify-center grow'
                contentFunction={() => (
                  <div className='flex w-full bg-opacity-75 px-2 items-start'>
                    {bitRate}
                    {bitRate === "default" ? "" : " Mbps"}
                  </div>
                )}
                clickFunction={() => {
                  setBitRate(
                    bitRate === "default" ? "default" : parseFloat(bitRate)
                  );
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
