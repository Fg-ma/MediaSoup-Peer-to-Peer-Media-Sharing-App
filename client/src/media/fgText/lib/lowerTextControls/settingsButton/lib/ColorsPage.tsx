import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  colorsOptionsTitles,
  ColorTypes,
} from "../../../typeConstant";
import FgDropdownButton from "../../../../../../elements/fgDropdownButton/FgDropdownButton";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import { tableColorMap } from "../../../../../../fgTable/lib/tableColors";
import ColorPickerButton from "../../../../../../elements/colorPickerButton/ColorPickerButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function ColorsPage({
  setActivePages,
  settings,
  setSettings,
  externalColorPickerPanelRefs,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  externalColorPickerPanelRefs: {
    backgroundColor: React.RefObject<HTMLDivElement>;
    textColor: React.RefObject<HTMLDivElement>;
    indexColor: React.RefObject<HTMLDivElement>;
  };
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseColorsPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.colors.active = !newActivePages.colors.active;

      return newActivePages;
    });
  };

  const handleSelectColor = (key: ColorTypes, color: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.colors[key].value = color;

      return newSettings;
    });
  };

  const handleInputColorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: ColorTypes
  ) => {
    const newColor = event.target.value?.trim();

    if (newColor && /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)) {
      setSettings((prev) => {
        const newSettings = { ...prev };

        // Ensure the hex has a leading #
        newSettings.colors[key].value = newColor.startsWith("#")
          ? newColor
          : `#${newColor}`;

        return newSettings;
      });
    }
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2'>
      <div className='flex h-6 w-full space-x-1 justify-start'>
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
          clickFunction={handleCloseColorsPage}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleCloseColorsPage}
        >
          Colors
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        ref={scrollingContainerRef}
        className='w-full flex flex-col space-y-4 overflow-y-auto px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'
      >
        {Object.entries(colorsOptionsTitles).map(([key, title]) => (
          <div
            key={key}
            className='flex w-full h-max flex-col space-y-1 items-center justify-center'
          >
            <FgDropdownButton
              className='w-full min-h-8 h-max text-lg'
              kind='popup'
              label={title}
              elements={Object.entries(tableColorMap).map(([color, info]) => (
                <div
                  key={color}
                  className='font-K2D rounded hover:bg-fg-tone-black-8 w-[95%] h-max'
                  style={{ color: info.primary }}
                  data-text-settings-color={info.primary}
                  onPointerUp={() =>
                    handleSelectColor(key as ColorTypes, info.primary)
                  }
                >
                  {info.name}
                </div>
              ))}
            />
            <div className='flex w-full h-max items-center'>
              <ColorPickerButton
                className='h-7 mr-1'
                defaultColor={settings.colors[key as ColorTypes].value}
                scrollingContainerRef={scrollingContainerRef}
                handleAcceptColorCallback={(event) =>
                  handleSelectColor(key as ColorTypes, event)
                }
                externalColorPickerPanelRef={
                  externalColorPickerPanelRefs[key as ColorTypes]
                }
              />
              <FgInput
                className='grow h-8 text-lg border-2 rounded-md'
                placeholder='color...'
                name='textSettingsColorInput'
                onChange={(event) =>
                  handleInputColorChange(event, key as ColorTypes)
                }
                options={{ submitButton: false }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
