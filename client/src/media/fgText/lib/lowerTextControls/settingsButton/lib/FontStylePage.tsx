import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  fontStylesOptionsMeta,
} from "../../../typeConstant";
import LazyFontButton from "./LazyFontButton";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export default function FontStylePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseFontStylePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.fontStyle.active = !newActivePages.fontStyle.active;

      return newActivePages;
    });
  };

  const handleSelectFontStyle = (fontStyle: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.fontStyle.value = fontStyle;

      return newSettings;
    });
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div className='flex h-6 w-full space-x-1 justify-start'>
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
          clickFunction={handleCloseFontStylePage}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleCloseFontStylePage}
        >
          Font styles
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='w-full flex flex-col space-y-4 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        {Object.entries(fontStylesOptionsMeta).map(([key, meta]) => (
          <LazyFontButton
            key={key}
            scrollingContainerRef={scrollingContainerRef}
            item={
              <FgButton
                className={`${
                  settings.fontStyle.value === meta.value
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center text-lg`}
                style={{
                  fontFamily: meta.value,
                }}
                contentFunction={() => <>{meta.title}</>}
                clickFunction={() => handleSelectFontStyle(meta.value)}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
