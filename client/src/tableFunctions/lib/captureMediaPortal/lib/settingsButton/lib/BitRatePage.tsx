import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import { Settings, ActivePages } from "../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

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
            clickFunction={handleCloseBitRatePage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseBitRatePage}
          >
            Bite rate
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
              className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseFloat(bitRate) ===
                settings.downloadVideoOptions.bitRate.value
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className="flex grow items-center justify-center"
                contentFunction={() => (
                  <div className="flex w-full items-start px-2">
                    {bitRate}
                    {bitRate === "default" ? "" : " Mbps"}
                  </div>
                )}
                clickFunction={() => {
                  setBitRate(
                    bitRate === "default" ? "default" : parseFloat(bitRate),
                  );
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
