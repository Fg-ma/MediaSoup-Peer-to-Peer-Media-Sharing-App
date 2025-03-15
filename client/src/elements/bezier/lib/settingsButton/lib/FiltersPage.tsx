import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  filtersMeta,
  FiltersTypes,
  BezierColorTypes,
} from "../../typeConstant";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";
import ColorPickerButton from "../../../../../elements/colorPickerButton/ColorPickerButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function FiltersPage({
  setActivePages,
  settings,
  setSettings,
  colorPickerRefs,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  colorPickerRefs: {
    [bezierColorType in BezierColorTypes]: React.RefObject<HTMLDivElement>;
  };
}) {
  const handleFiltersActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.filters.active = !newActivePages.filters.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (option: FiltersTypes) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.filters[option].value = !newSettings.filters[option].value;

      return newSettings;
    });
  };

  const handleAcceptColor = (
    filter: FiltersTypes,
    option: string,
    color: string
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      // @ts-ignore-error no coherence between filter and option
      newSettings.filters[filter][option].value = color;

      return newSettings;
    });
  };

  const handleValueChange = (
    filter: FiltersTypes,
    option: string,
    value: number
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      // @ts-ignore-error no coherence between filter and option
      newSettings.filters[filter][option].value = value;

      return newSettings;
    });
  };

  return (
    <div className='flex w-full h-full flex-col justify-center items-center space-y-2 font-K2D'>
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
          clickFunction={handleFiltersActive}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleFiltersActive}
        >
          Filters
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem] small-vertical-scroll-bar'>
        {Object.entries(filtersMeta).map(([key, filter]) => (
          <div
            key={key}
            className={`flex flex-col items-center justify-center w-full h-max space-y-1 rounded ${
              settings.filters[key as FiltersTypes].value === true &&
              filter.options.length !== 0
                ? "bg-fg-tone-black-7"
                : ""
            }`}
          >
            <FgButton
              className='w-full h-8'
              clickFunction={() => handleOptionSelect(key as FiltersTypes)}
              contentFunction={() => (
                <div
                  className={`${
                    settings.filters[key as FiltersTypes].value === true
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  } flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-center px-2 rounded items-center text-lg`}
                >
                  {filter.title}
                </div>
              )}
            />
            {settings.filters[key as FiltersTypes].value === true &&
              filter.options.map((option) =>
                option.type === "number" ? (
                  <div key={option.key} className='h-max w-[95%]'>
                    <FgSlider
                      className='h-16'
                      externalValue={
                        // @ts-ignore-error no coherence between filter and option
                        settings.filters[key as FiltersTypes][option.key].value
                      }
                      externalStyleValue={
                        // @ts-ignore-error no coherence between filter and option
                        settings.filters[key as FiltersTypes][option.key].value
                      }
                      onValueChange={(value) => {
                        handleValueChange(
                          key as FiltersTypes,
                          option.key,
                          value.value
                        );
                      }}
                      options={{
                        initValue:
                          // @ts-ignore-error no coherence between filter and option
                          settings.filters[key as FiltersTypes][option.key]
                            .value,
                        ticks: option.ticks,
                        rangeMax: option.rangeMax,
                        rangeMin: option.rangeMin,
                        orientation: "horizontal",
                        tickLabels: false,
                        precision: option.precision,
                        topLabel: option.title,
                        labelsColor: "#f2f2f2",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    key={option.key}
                    className='flex items-center justify-between w-[95%] h-max'
                  >
                    {option.title}
                    <ColorPickerButton
                      className='h-full aspect-square'
                      defaultColor={
                        // @ts-ignore key and option.key are string not types
                        settings.filters[key][option.key].value
                      }
                      externalColorPickerPanelRef={
                        colorPickerRefs[option.key as BezierColorTypes]
                      }
                      handleAcceptColorCallback={(_hex, hexa) =>
                        handleAcceptColor(key as FiltersTypes, option.key, hexa)
                      }
                      isAlpha={true}
                    />
                  </div>
                )
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
