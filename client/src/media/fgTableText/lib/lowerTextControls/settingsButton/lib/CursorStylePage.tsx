import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  Settings,
  ActivePages,
  cursorStylesOptionsMeta,
  CursorStyles,
} from "../../../typeConstant";
import LazyFontButton from "./LazyFontButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function CursorStylePage({
  setActivePages,
  settings,
  setSettings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseCursorStylePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.cursorStyle.active = !newActivePages.cursorStyle.active;

      return newActivePages;
    });
  };

  const handleSelectCursorStyle = (cursorStyle: CursorStyles) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.cursorStyle.value = cursorStyle;

      return newSettings;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-start space-x-1">
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
          clickFunction={handleCloseCursorStylePage}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleCloseCursorStylePage}
        >
          Cursor
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-white bg-opacity-75"></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        {Object.entries(cursorStylesOptionsMeta).map(([key, title]) => (
          <LazyFontButton
            key={key}
            scrollingContainerRef={scrollingContainerRef}
            item={
              <FgButton
                className={`${
                  settings.fontStyle.value === key
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                contentFunction={() => <>{title}</>}
                clickFunction={() =>
                  handleSelectCursorStyle(key as CursorStyles)
                }
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
