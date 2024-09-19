import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./ClosedCaptionsPage";
import ClosedCaptionsOptionsPage, {
  BackgroundColors,
  BackgroundOpacities,
  CharacterEdgeStyles,
  closedCaptionsOptionsArrays,
  FontColors,
  FontFamilies,
  FontOpacities,
  FontSizes,
} from "./ClosedCaptionsOptionsPage";
import PageTemplate from "./PageTemplate";

const SelectionPanelVar: Variants = {
  init: { opacity: 0 },
  animate: { opacity: 1 },
};

const SelectionPanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
  },
};

type ClosedCaptionOptions =
  | "fontFamily"
  | "fontColor"
  | "fontOpacity"
  | "fontSize"
  | "backgroundColor"
  | "backgroundOpacity"
  | "characterEdgeStyle";

const closedCaptionOptions = [
  "fontFamily",
  "fontColor",
  "fontOpacity",
  "fontSize",
  "backgroundColor",
  "backgroundOpacity",
  "characterEdgeStyle",
];

const closedCaptionOptionsPageTitles = {
  fontFamily: "Font family",
  fontColor: "Font color",
  fontOpacity: "Font opacity",
  fontSize: "Font size",
  backgroundColor: "Background color",
  backgroundOpacity: "Background opacity",
  characterEdgeStyle: "Character edge style",
};

export interface ActivePages {
  closedCaption: {
    active: boolean;
    value: keyof typeof closedCaptionsSelections;
    closedCaptionOptionsActive: {
      active: boolean;
      value: "";
      fontFamily: { active: boolean; value: FontFamilies };
      fontColor: { active: boolean; value: FontColors };
      fontOpacity: { active: boolean; value: FontOpacities };
      fontSize: { active: boolean; value: FontSizes };
      backgroundColor: { active: boolean; value: BackgroundColors };
      backgroundOpacity: { active: boolean; value: BackgroundOpacities };
      characterEdgeStyle: { active: boolean; value: CharacterEdgeStyles };
    };
  };
}

export default function SettingsPanel({
  settingsPanelRef,
  settingsButtonRef,
}: {
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [activePages, setActivePages] = useState<ActivePages>({
    closedCaption: {
      active: false,
      value: "English",
      closedCaptionOptionsActive: {
        active: false,
        value: "",
        fontFamily: { active: false, value: "K2D" },
        fontColor: { active: false, value: "white" },
        fontOpacity: { active: false, value: "75%" },
        fontSize: { active: false, value: "Base" },
        backgroundColor: { active: false, value: "white" },
        backgroundOpacity: { active: false, value: "75%" },
        characterEdgeStyle: { active: false, value: "None" },
      },
    },
  });

  // Function to check if a key or its descendants are active
  const isDescendantActive = (
    obj: Record<string, any>,
    init: boolean = true
  ): boolean => {
    // Check if the current object has an 'active' property and if it's true
    if (!init && obj.active === true) {
      return true;
    }

    // Iterate over all keys in the object
    for (const key in obj) {
      // Check if the value is an object, and if so, recurse into it
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (isDescendantActive(obj[key], false)) {
          return true;
        }
      }
    }

    // Return false if no 'active' property is true in the current object or its descendants
    return false;
  };

  useEffect(() => {
    getStaticPanelPosition();
  }, [activePages]);

  const getStaticPanelPosition = () => {
    const externalRect = settingsButtonRef?.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!externalRect || !settingsPanelRef.current) {
      return;
    }

    let top = externalRect.top - settingsPanelRef.current?.clientHeight - 8;

    // Check if the panel overflows the top of the viewport
    if (top < 0) {
      top = 0; // Adjust to fit within the top boundary of the viewport
    }

    // Check if the panel overflows the bottom of the viewport
    const panelBottom = top + settingsPanelRef.current.clientHeight;
    if (panelBottom > viewportHeight) {
      // Adjust to fit within the bottom boundary of the viewport
      top = viewportHeight - settingsPanelRef.current.clientHeight;
    }

    let left =
      externalRect.left +
      externalRect.width / 2 -
      settingsPanelRef.current.clientWidth / 2;

    // Check if the panel overflows the left of the viewport
    if (left < 0) {
      left = 0; // Adjust to fit within the left boundary of the viewport
    }

    // Check if the panel overflows the bottom of the viewport
    const panelRight = left + settingsPanelRef.current.clientWidth;
    if (panelRight > viewportWidth) {
      // Adjust to fit within the bottom boundary of the viewport
      left = viewportWidth - settingsPanelRef.current.clientWidth;
    }

    setPortalPosition({
      top,
      left,
    });
  };

  const handleClosedCaptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

      return newActivePages;
    });
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className='max-h-60 w-max absolute z-[99999999999999] flex p-2 h-max shadow-md rounded bg-black bg-opacity-75 font-K2D text-base text-white'
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
      }}
      variants={SelectionPanelVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={SelectionPanelTransition}
    >
      {!isDescendantActive(activePages) && (
        <div className='w-full h-full flex flex-col justify-center items-center space-y-1 px-1'>
          <FgButton
            contentFunction={() => (
              <div className='w-full text-nowrap hover:bg-gray-400 flex justify-between space-x-4 px-2 rounded items-center'>
                <div>Subtitles/cc</div>
                <div>
                  {closedCaptionsSelections[activePages.closedCaption.value]}
                </div>
              </div>
            )}
            mouseDownFunction={handleClosedCaptionsActive}
          />
        </div>
      )}
      {activePages.closedCaption.active &&
        !isDescendantActive(activePages.closedCaption) && (
          <ClosedCaptionsPage
            activePages={activePages}
            setActivePages={setActivePages}
          />
        )}
      {activePages.closedCaption.active &&
        activePages.closedCaption.closedCaptionOptionsActive.active &&
        !isDescendantActive(
          activePages.closedCaption.closedCaptionOptionsActive
        ) && (
          <ClosedCaptionsOptionsPage
            activePages={activePages}
            setActivePages={setActivePages}
          />
        )}
      {activePages.closedCaption.active &&
        activePages.closedCaption.closedCaptionOptionsActive.active &&
        closedCaptionOptions.map((option) => {
          const activePage =
            activePages.closedCaption.closedCaptionOptionsActive[
              option as ClosedCaptionOptions
            ];

          return (
            activePage.active && (
              <PageTemplate
                key={option}
                content={closedCaptionsOptionsArrays[
                  option as ClosedCaptionOptions
                ].map((type) => (
                  <FgButton
                    key={type}
                    className={`w-full rounded bg-opacity-75 min-w-32 px-2 ${
                      type === activePage.value
                        ? "bg-gray-400"
                        : "hover:bg-gray-400"
                    }`}
                    contentFunction={() => (
                      <div className='flex justify-start items-start'>
                        {type}
                      </div>
                    )}
                    clickFunction={() => {
                      setActivePages((prev) => {
                        const newActivePages = { ...prev };

                        newActivePages.closedCaption.closedCaptionOptionsActive[
                          option as ClosedCaptionOptions
                        ].value = type;

                        return newActivePages;
                      });
                    }}
                  />
                ))}
                pageTitle={
                  closedCaptionOptionsPageTitles[option as ClosedCaptionOptions]
                }
                backFunction={() => {
                  setActivePages((prev) => {
                    const newActivePages = { ...prev };

                    newActivePages.closedCaption.closedCaptionOptionsActive[
                      option as ClosedCaptionOptions
                    ].active =
                      !newActivePages.closedCaption.closedCaptionOptionsActive[
                        option as ClosedCaptionOptions
                      ].active;

                    return newActivePages;
                  });
                }}
              />
            )
          );
        })}
    </motion.div>,
    document.body
  );
}
