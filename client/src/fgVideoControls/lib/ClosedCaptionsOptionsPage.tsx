import React from "react";
import navigateBackIcon from "../../../public/svgs/navigateBack.svg";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import {
  ActivePages,
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "../FgVideoControls";

import navigateForwardIcon from "../../../public/svgs/navigateForward.svg";
import { Settings } from "src/fgVideo/FgVideo";

export interface ClosedCaptionsOptions {
  fontFamily: FontFamilies;
  fontColor: FontColors;
  fontOpacity: FontOpacities;
  fontSize: FontSizes;
  backgroundColor: BackgroundColors;
  backgroundOpacity: BackgroundOpacities;
  characterEdgeStyle: CharacterEdgeStyles;
}

export const closedCaptionsOptionsArrays: {
  fontFamily: FontFamilies[];
  fontColor: FontColors[];
  fontOpacity: FontOpacities[];
  fontSize: FontSizes[];
  backgroundColor: BackgroundColors[];
  backgroundOpacity: BackgroundOpacities[];
  characterEdgeStyle: CharacterEdgeStyles[];
} = {
  fontFamily: ["K2D", "Josephin", "mono", "sans", "serif", "thin", "bold"],
  fontColor: [
    "white",
    "black",
    "red",
    "green",
    "blue",
    "magenta",
    "orange",
    "cyan",
  ],
  fontOpacity: ["25%", "50%", "75%", "100%"],
  fontSize: ["xsmall", "small", "base", "medium", "large", "xlarge"],
  backgroundColor: [
    "white",
    "black",
    "red",
    "green",
    "blue",
    "magenta",
    "orange",
    "cyan",
  ],
  backgroundOpacity: ["25%", "50%", "75%", "100%"],
  characterEdgeStyle: ["None", "Shadow", "Raised", "Inset", "Outline"],
};

const closedCaptionsOptionsTitles = {
  fontFamily: "Font family",
  fontColor: "Font color",
  fontOpacity: "Font opacity",
  fontSize: "Font size",
  backgroundColor: "BG color",
  backgroundOpacity: "BG opacity",
  characterEdgeStyle: "Edge style",
};

export default function ClosedCaptionsOptionsPage({
  setActivePages,
  settings,
}: {
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
}) {
  const handleClosedCaptionOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive.active =
        !newActivePages.closedCaption.closedCaptionOptionsActive.active;

      return newActivePages;
    });
  };

  const handleOptionSelect = (
    option: keyof typeof closedCaptionsOptionsTitles
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive[option].active =
        !newActivePages.closedCaption.closedCaptionOptionsActive[option].active;

      return newActivePages;
    });
  };

  return (
    <div className='w-full h-full flex flex-col justify-center items-center space-y-2 font-K2D'>
      <div className='h-6 w-full flex space-x-1 justify-start'>
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
          mouseDownFunction={handleClosedCaptionOptionsActive}
        />
        <div
          className='cursor-pointer font-Josefin text-lg font-bold pt-0.5'
          onClick={handleClosedCaptionOptionsActive}
        >
          Options
        </div>
      </div>
      <div className='w-[95%] h-0.5 rounded-full bg-white bg-opacity-75'></div>
      <div className='small-scroll-bar w-full flex flex-col space-y-1 overflow-y-auto justify-start px-2 h-max max-h-[11.375rem]'>
        {Object.keys(closedCaptionsOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className='w-full h-8'
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof closedCaptionsOptionsArrays
              )
            }
            contentFunction={() => (
              <div className='flex w-full justify-between space-x-4 px-2 bg-opacity-75 hover:bg-gray-400 rounded text-nowrap'>
                <div>
                  {
                    closedCaptionsOptionsTitles[
                      option as keyof typeof closedCaptionsOptionsArrays
                    ]
                  }
                </div>
                <div className='flex space-x-1 items-center justify-center'>
                  <div>
                    {
                      settings.closedCaption.closedCaptionOptionsActive[
                        option as keyof typeof closedCaptionsOptionsArrays
                      ].value
                    }
                  </div>
                  <FgSVG
                    src={navigateForwardIcon}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                      { key: "fill", value: "white" },
                      { key: "stroke", value: "white" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
