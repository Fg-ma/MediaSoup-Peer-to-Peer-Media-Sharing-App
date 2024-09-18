import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
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
  currentCaptionLanguage,
  setCurrentCaptionLanguage,
  setClosedCaptionsActive,
}: {
  currentCaptionLanguage: keyof typeof closedCaptionsSelections;
  setCurrentCaptionLanguage: React.Dispatch<
    React.SetStateAction<keyof typeof closedCaptionsSelections>
  >;
  setClosedCaptionsActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const setClosedCaptionsLang = (
    newLang: keyof typeof closedCaptionsSelections
  ) => {
    setCurrentCaptionLanguage(newLang);
  };

  const handleCloseClosedCaptionPage = () => {
    setClosedCaptionsActive((prev) => !prev);
  };

  return (
    <div className='w-full h-full flex flex-col justify-center items-center space-y-2'>
      <div className='h-6 w-full'>
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
        <FgButton />
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div
        className='w-full flex flex-col justify-center items-center space-y-1 overflow-y-auto'
        style={{ height: "calc(14rem - 2.625rem)" }}
      >
        {Object.entries(closedCaptionsSelections).map(([key, lang]) => (
          <FgButton
            key={key}
            className='w-full flex items-center justify-center'
            contentFunction={() => (
              <div
                className={`w-full text-nowrap bg-opacity-75 flex px-1 rounded justify-between space-x-4 ${
                  key === currentCaptionLanguage
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
