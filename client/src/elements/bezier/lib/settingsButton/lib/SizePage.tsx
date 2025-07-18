import React, { useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadOptionsArrays,
} from "../../typeConstant";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";

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
            clickFunction={handleCloseSizePage}
          />
          <div
            className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
            onClick={handleCloseSizePage}
          >
            Size
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
            className={`flex w-full items-center justify-center text-nowrap rounded hover:bg-fg-white hover:text-fg-tone-black-1 ${
              parseInt(size) === settings.downloadOptions.size.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            }`}
          >
            <FgButton
              className="flex grow items-center justify-center"
              contentFunction={() => (
                <div className="flex w-full items-start px-2">{size}</div>
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
