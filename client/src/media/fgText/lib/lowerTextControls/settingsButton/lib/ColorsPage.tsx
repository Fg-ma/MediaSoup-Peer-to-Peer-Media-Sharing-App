import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  colorsOptionsTitles,
  ColorTypes,
} from "../../../typeConstant";
import FgDropdownButton from "../../../../../../elements/fgDropdownButton/FgDropdownButton";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import { tableColorMap } from "../../../../../../fgTable/lib/tableColors";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetSeverBaseUrl + "svgs/navigateBack.svg";

export default function ColorsPage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const setColor = (type: ColorTypes, indexColor: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.colors.indexColor.value = indexColor;

      return newSettings;
    });
  };

  const handleCloseColorsPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.colors.active = !newActivePages.colors.active;

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
            clickFunction={handleCloseColorsPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseColorsPage}
          >
            Colors
          </div>
        </div>
        <div></div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='small-scroll-bar w-full flex flex-col space-y-4 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        {Object.entries(colorsOptionsTitles).map(([key, title]) => (
          <div
            key={key}
            className='flex w-full h-max flex-col space-y-1 items-center justify-center'
          >
            <FgDropdownButton
              className='w-full min-h-8 h-max text-lg border-2 rounded-md'
              label={
                <div className='flex font-Josefin justify-center items-center space-x-2'>
                  <div
                    className='h-6 aspect-square rounded-sm border-fg-white'
                    style={{
                      borderWidth: "1px",
                      backgroundColor: settings.colors[key as ColorTypes].value,
                    }}
                  ></div>
                  <div className='pt-1.5'>{title}</div>
                </div>
              }
              elements={Object.entries(tableColorMap).map(([color, info]) => (
                <div
                  key={color}
                  className='font-K2D rounded hover:bg-fg-tone-black-8 w-[95%] h-max'
                  style={{ color: info.primary }}
                  data-text-settings-color={info.primary}
                  onPointerUp={() =>
                    setSettings((prev) => {
                      const newSettings = { ...prev };

                      newSettings.colors[key as ColorTypes].value =
                        info.primary;

                      return newSettings;
                    })
                  }
                >
                  {info.name}
                </div>
              ))}
            />
            <FgInput
              className='max-w-full w-full h-8 text-lg border-2 rounded-md'
              placeholder='color...'
              name='textSettingsColorInput'
              onChange={(event) => {
                const newColor = event.target.value?.trim();

                if (
                  newColor &&
                  /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)
                ) {
                  setSettings((prev) => {
                    const newSettings = { ...prev };

                    // Ensure the hex has a leading #
                    newSettings.colors[key as ColorTypes].value =
                      newColor.startsWith("#") ? newColor : `#${newColor}`;

                    return newSettings;
                  });
                }
              }}
              options={{ submitButton: false }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
