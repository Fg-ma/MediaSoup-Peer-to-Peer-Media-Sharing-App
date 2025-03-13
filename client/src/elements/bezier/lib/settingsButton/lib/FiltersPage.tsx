import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import {
  Settings,
  ActivePages,
  filtersMeta,
  FiltersTypes,
} from "../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function FiltersPage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
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
          <FgButton
            key={key}
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
        ))}
      </div>
    </div>
  );
}
