import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "../../../../../../media/fgTableVideo/lib/typeConstant";

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
  videoMediaInstance,
  setRerender,
}: {
  videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activePages, setActivePages] = useState({
    fontFamily: false,
    fontColor: false,
    fontOpacity: false,
    fontSize: false,
    backgroundColor: false,
    backgroundOpacity: false,
    characterEdgeStyle: false,
  });

  const fontFamiliesRef = useRef<HTMLDivElement>(null);
  const fontColorRef = useRef<HTMLDivElement>(null);
  const fontOpacityRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const backgroundColorRef = useRef<HTMLDivElement>(null);
  const backgroundOpacityRef = useRef<HTMLDivElement>(null);
  const characterEdgeStyleRef = useRef<HTMLDivElement>(null);
  const refs = {
    fontFamily: fontFamiliesRef,
    fontColor: fontColorRef,
    fontOpacity: fontOpacityRef,
    fontSize: fontSizeRef,
    backgroundColor: backgroundColorRef,
    backgroundOpacity: backgroundOpacityRef,
    characterEdgeStyle: characterEdgeStyleRef,
  };

  const handleOptionSelect = (
    option: keyof typeof closedCaptionsOptionsArrays,
  ) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages[option] = !newActivePages[option];

      return newActivePages;
    });
  };

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 2rem)" }}
      ></div>
      {Object.keys(closedCaptionsOptionsArrays).map((option) => (
        <>
          <FgButton
            key={option}
            className="h-8"
            style={{ width: "calc(100% - 2rem)" }}
            clickFunction={() =>
              handleOptionSelect(
                option as keyof typeof closedCaptionsOptionsArrays,
              )
            }
            contentFunction={() => (
              <div className="flex w-full justify-between space-x-2 text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                <div
                  className="truncate"
                  ref={refs[option as keyof typeof closedCaptionsOptionsArrays]}
                  style={{ maxWidth: "calc(100% - 2rem)" }}
                >
                  {
                    closedCaptionsOptionsTitles[
                      option as keyof typeof closedCaptionsOptionsArrays
                    ]
                  }
                </div>
                <div
                  className="flex items-center justify-center space-x-1"
                  style={{
                    width: `calc(100% - ${refs[option as keyof typeof closedCaptionsOptionsArrays].current?.clientWidth ?? 0}px - 1rem)`,
                  }}
                >
                  <div
                    className="truncate text-end"
                    style={{ width: "calc(100% - 1.25rem)" }}
                  >
                    {
                      videoMediaInstance.current.settings.closedCaption
                        .closedCaptionOptions[
                        option as keyof typeof closedCaptionsOptionsArrays
                      ].value
                    }
                  </div>
                  <FgSVGElement
                    src={navigateForwardIcon}
                    className={`${activePages[option as keyof typeof closedCaptionsOptionsArrays] ? "-scale-x-100" : ""} rotate-90`}
                    attributes={[
                      { key: "width", value: "1.25rem" },
                      { key: "height", value: "1.25rem" },
                    ]}
                  />
                </div>
              </div>
            )}
          />
          {activePages[option as keyof typeof closedCaptionsOptionsArrays] && (
            <>
              <div
                className="h-0.5 rounded-full bg-fg-red-light"
                style={{ width: "calc(100% - 2.5rem)" }}
              ></div>
              {closedCaptionsOptionsArrays[
                option as keyof typeof closedCaptionsOptionsArrays
              ].map((type) => (
                <FgButton
                  key={type}
                  style={{ width: "calc(100% - 2.5rem)" }}
                  className={`rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                    type ===
                    videoMediaInstance.current.settings.closedCaption
                      .closedCaptionOptions[
                      option as keyof typeof closedCaptionsOptionsArrays
                    ].value
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  }`}
                  contentFunction={() => (
                    <div className="flex items-start justify-start">{type}</div>
                  )}
                  clickFunction={() => {
                    videoMediaInstance.current.settings.closedCaption.closedCaptionOptions[
                      option as keyof typeof closedCaptionsOptionsArrays
                    ].value = type;

                    setRerender((prev) => !prev);
                  }}
                />
              ))}
            </>
          )}
        </>
      ))}
    </>
  );
}
