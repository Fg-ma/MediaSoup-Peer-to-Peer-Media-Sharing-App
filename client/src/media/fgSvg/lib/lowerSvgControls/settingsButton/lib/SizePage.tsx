import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  downloadOptionsArrays,
} from "../../../typeConstant";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";
import SvgMediaInstance from "../../../../../../media/fgSvg/SvgMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function SizePage({
  svgMedia,
  setActivePages,
  settings,
  setSettings,
}: {
  svgMedia: SvgMediaInstance;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setSize = (type: "width" | "height", value: number) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.downloadOptions.size[type].value = value;

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

  const handleToggleAspect = () => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      if (newSettings.downloadOptions.size.value === "free") {
        newSettings.downloadOptions.size.value = "aspect";
        setSize(
          "height",
          newSettings.downloadOptions.size.width.value / (svgMedia.aspect ?? 1)
        );
      } else {
        newSettings.downloadOptions.size.value = "free";
      }

      return newSettings;
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
      <div className='w-[95%] h-0.5 rounded-full bg-fg-white'></div>
      <div
        ref={scrollingContainerRef}
        className='small-vertical-scroll-bar w-full flex items-start justify-center overflow-y-auto h-max max-h-[11.375rem]'
      >
        <div className='flex w-full flex-col space-y-1 px-2 h-max'>
          <FgButton
            className='w-full h-7'
            contentFunction={() => (
              <div
                className={`${
                  settings.downloadOptions.size.value === "aspect"
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center text-lg`}
              >
                {settings.downloadOptions.size.value === "aspect"
                  ? "Disable aspect"
                  : "Enable aspect"}
              </div>
            )}
            clickFunction={handleToggleAspect}
          />
          <FgSlider
            style={{ height: "2.5rem" }}
            externalValue={settings.downloadOptions.size.width.value}
            externalStyleValue={settings.downloadOptions.size.width.value}
            onValueChange={(value) => {
              setSize("width", value.value);
              if (settings.downloadOptions.size.value === "aspect") {
                setSize("height", value.value / (svgMedia.aspect ?? 1));
              }
            }}
            options={{
              initValue: settings.downloadOptions.size.width.value,
              ticks: 7,
              rangeMax: 32768,
              rangeMin: 1,
              orientation: "horizontal",
              tickLabels: false,
              precision: 0,
              snapToWholeNum: true,
              topLabel: "Width",
              labelsColor: "#f2f2f2",
            }}
          />
          <FgSlider
            style={{ height: "2.5rem" }}
            externalValue={settings.downloadOptions.size.height.value}
            externalStyleValue={settings.downloadOptions.size.height.value}
            onValueChange={(value) => {
              setSize("height", value.value);
              if (settings.downloadOptions.size.value === "aspect") {
                setSize("width", value.value * (svgMedia.aspect ?? 1));
              }
            }}
            options={{
              initValue: settings.downloadOptions.size.height.value,
              ticks: 7,
              rangeMax: 32768,
              rangeMin: 1,
              orientation: "horizontal",
              tickLabels: false,
              precision: 0,
              snapToWholeNum: true,
              topLabel: "Height",
              labelsColor: "#f2f2f2",
            }}
          />
          {downloadOptionsArrays.size.map((size) => (
            <div
              key={size}
              className={`w-full text-nowrap flex rounded items-center justify-center hover:bg-fg-white hover:text-fg-tone-black-1 ${
                parseInt(size) === settings.downloadOptions.size.width.value &&
                settings.downloadOptions.size.value === "aspect"
                  ? "bg-fg-white text-fg-tone-black-1"
                  : ""
              }`}
            >
              <FgButton
                className='flex items-center justify-center grow'
                contentFunction={() => (
                  <div className='flex w-full px-2 items-start'>
                    {size}x{parseInt(size) / (svgMedia.aspect ?? 1)}
                  </div>
                )}
                clickFunction={() => {
                  setSize("width", parseInt(size));
                  setSize("height", parseInt(size) / (svgMedia.aspect ?? 1));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
