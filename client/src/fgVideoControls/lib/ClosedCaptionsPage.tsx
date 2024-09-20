import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";

import navigateBackIcon from "../../../public/svgs/navigateBack.svg";
import { ActivePages } from "../FgVideoControls";
import { Settings } from "src/fgVideo/FgVideo";

export const closedCaptionsSelections = {
  ["Catalan"]: "Catalan",
  ["Chinese"]: "Chinese",
  ["Deutsch"]: "Deutsch",
  ["IndianEnglish"]: "Indian English",
  ["English"]: "English (US)",
  ["Español"]: "Español",
  ["Farsi"]: "Farsi",
  ["French"]: "French",
  ["Italiano"]: "Italiano",
  ["Portuguese"]: "Portuguese",
  ["Russian"]: "Russian",
  ["Turkish"]: "Turkish",
  ["Vietnamese"]: "Vietnamese",
};

export default function ClosedCaptionsPage({
  activePages,
  setActivePages,
  settings,
  setSettings,
}: {
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.closedCaption.value = newLang;

      return newSettings;
    });
  };

  const handleCloseClosedCaptionPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

      return newActivePages;
    });
  };

  const handleClosedCaptionOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive.active =
        !newActivePages.closedCaption.closedCaptionOptionsActive.active;

      return newActivePages;
    });
  };

  return (
    <div className='w-full h-full flex flex-col justify-center items-center space-y-2'>
      <div className='h-6 w-full flex justify-between'>
        <div className='w-full flex space-x-1'>
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
            mouseDownFunction={handleCloseClosedCaptionPage}
          />
          <div
            className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
            onClick={handleCloseClosedCaptionPage}
          >
            Subtitles
          </div>
        </div>
        <FgButton
          contentFunction={() => (
            <div className='px-2 bg-opacity-75 hover:bg-gray-400 rounded font-Josefin text-lg font-bold pt-0.5'>
              Options
            </div>
          )}
          mouseDownFunction={handleClosedCaptionOptionsActive}
        />
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='smallScrollbar w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem]'>
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <div
            className={`w-full text-nowrap bg-opacity-75 flex rounded items-center justify-center ${
              key === settings.closedCaption.value
                ? "bg-gray-400"
                : "hover:bg-gray-400"
            }`}
          >
            <FgButton
              key={key}
              className='flex items-center justify-center grow'
              contentFunction={() => (
                <div className='w-full bg-opacity-75 px-2 flex items-start'>
                  {lang}
                </div>
              )}
              mouseDownFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections
                )
              }
            />
            <FgButton
              key={key}
              className='w-max flex items-center justify-center'
              contentFunction={() => (
                <div className='w-full bg-opacity-75 px-2'>(AG)</div>
              )}
              mouseDownFunction={() =>
                setClosedCaptionsLang(
                  key as keyof typeof closedCaptionsSelections
                )
              }
              hoverContent={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-sm bg-white shadow-lg rounded-md relative bottom-0'>
                  Auto generated
                </div>
              }
              options={{
                hoverTimeoutDuration: 2000,
                hoverZValue: 999999999999999,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
