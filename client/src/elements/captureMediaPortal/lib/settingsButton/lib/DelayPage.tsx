import React, { useRef } from "react";
import FgButton from "../../../../fgButton/FgButton";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

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
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-between">
        <div className="flex w-full space-x-1">
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
            clickFunction={handleCloseDelayPage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseDelayPage}
          >
            Delay
          </div>
        </div>
        <div></div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div
        ref={scrollingContainerRef}
        className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        <FgSlider
          className="h-10"
          externalValue={settings.delay.value}
          externalStyleValue={settings.delay.value}
          onValueChange={(value) => {
            setDelay(value.value);
          }}
          options={{
            initValue: settings.delay.value,
            ticks: 7,
            rangeMax: 120,
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
              className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseInt(delay) === settings.delay.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className="flex grow items-center justify-center"
                contentFunction={() => (
                  <div className="flex w-full items-start px-2">
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
