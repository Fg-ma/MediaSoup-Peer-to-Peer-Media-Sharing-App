import React, { useEffect, useState } from "react";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../../elements/fgButton/FgButton";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./ClosedCaptionsPage";
import ClosedCaptionsOptionsPage, {
  closedCaptionsOptionsArrays,
} from "./ClosedCaptionsOptionsPage";
import PageTemplate from "./PageTemplate";
import { ActivePages } from "../../../FgLowerVisualMediaControls";
import { FgVisualMediaOptions, Settings } from "../../../../typeConstant";
import FgPortal from "../../../../../../../elements/fgPortal/FgPortal";

const panelVariants: Variants = {
  init: {
    x: "10%", // Start from the right
    opacity: 0,
    position: "absolute",
  },
  animate: {
    x: 0, // Move to the center
    opacity: 1,
    position: "relative",
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.05 },
    },
  },
  exit: {
    x: "-10%", // Move to the left when exiting
    opacity: 0,
    position: "absolute",
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0 },
    },
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

export default function SettingsPanel({
  fgVisualMediaOptions,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
}: {
  fgVisualMediaOptions: FgVisualMediaOptions;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const [_, setRerender] = useState(false);

  // Function to check if a key or its descendants are active
  const isDescendantActive = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>,
    init: boolean = true,
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

  const handleClosedCaptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

      return newActivePages;
    });
  };

  useEffect(() => {
    setRerender((prev) => !prev);
  }, []);

  return (
    <FgPortal
      type="above"
      spacing={4}
      externalRef={settingsButtonRef}
      className="pointer-events-auto absolute z-settings-panel flex h-max max-h-80 w-64 rounded-md border-2 border-fg-white bg-fg-tone-black-1 p-2 font-K2D text-base text-fg-white shadow-md shadow-fg-tone-black-8"
      externalPortalRef={settingsPanelRef}
      content={
        <>
          <AnimatePresence>
            {!isDescendantActive(activePages) && (
              <motion.div
                className="flex h-full w-full flex-col items-center justify-center space-y-1 px-1"
                variants={panelVariants}
                initial="init"
                animate="animate"
                exit="exit"
              >
                {fgVisualMediaOptions.isVolume && (
                  <FgButton
                    className="w-full"
                    contentFunction={() => (
                      <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                        <div>Subtitles</div>
                        <div>
                          {Object.prototype.hasOwnProperty.call(
                            closedCaptionsSelections,
                            settings.closedCaption.value,
                          ) &&
                            closedCaptionsSelections[
                              settings.closedCaption.value
                            ]}
                        </div>
                      </div>
                    )}
                    clickFunction={handleClosedCaptionsActive}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              !isDescendantActive(activePages.closedCaption) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <ClosedCaptionsPage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              activePages.closedCaption.closedCaptionOptionsActive.active &&
              !isDescendantActive(
                activePages.closedCaption.closedCaptionOptionsActive,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <ClosedCaptionsOptionsPage
                    setActivePages={setActivePages}
                    settings={settings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              activePages.closedCaption.closedCaptionOptionsActive.active &&
              isDescendantActive(
                activePages.closedCaption.closedCaptionOptionsActive,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {closedCaptionOptions.map((option) => {
                    const activePage =
                      activePages.closedCaption.closedCaptionOptionsActive[
                        option as ClosedCaptionOptions
                      ];
                    const activeSetting =
                      settings.closedCaption.closedCaptionOptionsActive[
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
                              className={`w-full min-w-32 rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                                type === activeSetting.value
                                  ? "bg-fg-white text-fg-tone-black-1"
                                  : ""
                              }`}
                              contentFunction={() => (
                                <div className="flex items-start justify-start">
                                  {type}
                                </div>
                              )}
                              clickFunction={() => {
                                setSettings((prev) => {
                                  const newSettings = { ...prev };

                                  newSettings.closedCaption.closedCaptionOptionsActive[
                                    option as ClosedCaptionOptions
                                  ].value = type;

                                  return newSettings;
                                });
                              }}
                            />
                          ))}
                          pageTitle={
                            closedCaptionOptionsPageTitles[
                              option as ClosedCaptionOptions
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.closedCaption.closedCaptionOptionsActive[
                                option as ClosedCaptionOptions
                              ].active =
                                !newActivePages.closedCaption
                                  .closedCaptionOptionsActive[
                                  option as ClosedCaptionOptions
                                ].active;

                              return newActivePages;
                            });
                          }}
                        />
                      )
                    );
                  })}
                </motion.div>
              )}
          </AnimatePresence>
        </>
      }
    />
  );
}
