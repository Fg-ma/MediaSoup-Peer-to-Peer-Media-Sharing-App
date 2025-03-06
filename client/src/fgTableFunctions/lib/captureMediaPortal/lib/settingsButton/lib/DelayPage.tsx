import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export const delaySelections = ["0", "3", "5", "10", "15", "30", "60"];

export default function DelayPage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setDelay = (delay: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.delay.value = delay;

      return newSettings;
    });
  };

  const handleCloseDelayPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.delay.active = !newActivePages.delay.active;

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
            clickFunction={handleCloseDelayPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseDelayPage}
          >
            Delay
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
          externalValue={settings.delay.value}
          externalStyleValue={settings.delay.value}
          onValueChange={(value) => {
            setDelay(value.value);
          }}
          options={{
            initValue: settings.delay.value,
            ticks: 7,
            rangeMax: 600,
            rangeMin: 0,
            snapToWholeNum: true,
            orientation: "horizontal",
            tickLabels: false,
          }}
        />
        {Object.entries(delaySelections)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([key, delay]) => (
            <div
              key={key}
              className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseInt(delay) === settings.delay.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className='flex items-center justify-center grow'
                contentFunction={() => (
                  <div className='flex w-full bg-opacity-75 px-2 items-start'>
                    {delay} seconds
                  </div>
                )}
                clickFunction={() => {
                  setDelay(parseInt(delay));
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
