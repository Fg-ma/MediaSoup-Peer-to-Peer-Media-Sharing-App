import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { ActivePages } from "./SettingsPanel";

import navigateBackIcon from "../../../public/svgs/navigateBack.svg";

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
}: {
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
}) {
  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.value = newLang;

      return newActivePages;
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
        <div className='flex space-x-1'>
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
            Subtitles/CC
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
      <div className='w-full flex flex-col space-y-1 overflow-y-auto px-2 h-max max-h-[11.375rem]'>
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <FgButton
            key={key}
            className='w-full flex items-center justify-center'
            contentFunction={() => (
              <div
                className={`w-full text-nowrap bg-opacity-75 flex px-2 rounded justify-between space-x-4 ${
                  key === activePages.closedCaption.value
                    ? "bg-gray-400"
                    : "hover:bg-gray-400"
                }`}
              >
                <div>{lang}</div>
                <div>(auto generated)</div>
              </div>
            )}
            mouseDownFunction={() =>
              setClosedCaptionsLang(
                key as keyof typeof closedCaptionsSelections
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
