import React from "react";
import FgButton from "../../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  ActivePages,
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "../../../FgLowerVisualMediaControls";
import { Settings } from "../../../../typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

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
    option: keyof typeof closedCaptionsOptionsTitles,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.closedCaptionOptionsActive[option].active =
        !newActivePages.closedCaption.closedCaptionOptionsActive[option].active;

      return newActivePages;
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 font-K2D">
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
          clickFunction={handleClosedCaptionOptionsActive}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleClosedCaptionOptionsActive}
        >
          Options
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-white"></div>
      <div className="small-scroll-bar small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col justify-start space-y-1 overflow-y-auto px-2">
        {Object.keys(closedCaptionsOptionsArrays).map((option) => (
          <FgButton
            key={option}
            className="h-8 w-full"
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof closedCaptionsOptionsArrays,
              )
            }
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-4 text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                <div>
                  {
                    closedCaptionsOptionsTitles[
                      option as keyof typeof closedCaptionsOptionsArrays
                    ]
                  }
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div>
                    {
                      settings.closedCaption.closedCaptionOptionsActive[
                        option as keyof typeof closedCaptionsOptionsArrays
                      ].value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                      { key: "fill", value: "#f2f2f2" },
                      { key: "stroke", value: "#f2f2f2" },
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
