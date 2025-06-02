import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import {
  Settings,
  ActivePages,
  downloadTypeSelections,
  downloadTypeOptions,
  DownloadTypeOptionsTypes,
  downloadTypeOptionsTitles,
  downloadTypeOptionsArrays,
} from "../../../typeConstant";
import DownloadTypePage from "./DownloadTypePage";
import DownloadTypeOptionsPage from "./DownloadTypeOptionsPage";
import PageTemplate from "./PageTemplate";
import LowerApplicationController from "../../LowerApplicationController";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";

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

export default function SettingsPanel({
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
  lowerApplicationController,
}: {
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  lowerApplicationController: React.MutableRefObject<LowerApplicationController>;
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

  const handleDownloadTypeActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.active = !newActivePages.downloadType.active;

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
      className="pointer-events-auto z-settings-panel flex h-max max-h-80 w-64 rounded-md border-2 border-fg-white bg-fg-tone-black-1 p-2 font-K2D text-base text-fg-white shadow-md shadow-fg-tone-black-8"
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
                <FgButton
                  className="h-7 w-full"
                  contentFunction={() => (
                    <div
                      className={`${
                        settings.background.value === "true"
                          ? "bg-fg-white text-fg-tone-black-1"
                          : ""
                      } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                    >
                      Set as background (b)
                    </div>
                  )}
                  clickFunction={
                    lowerApplicationController.current.handleSetAsBackground
                  }
                />
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                      <div>Download</div>
                      <div>
                        {Object.prototype.hasOwnProperty.call(
                          downloadTypeSelections,
                          settings.downloadType.value,
                        ) &&
                          downloadTypeSelections[settings.downloadType.value]}
                      </div>
                    </div>
                  )}
                  clickFunction={handleDownloadTypeActive}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              !isDescendantActive(activePages.downloadType) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadTypePage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              activePages.downloadType.downloadTypeOptions.active &&
              !isDescendantActive(
                activePages.downloadType.downloadTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadTypeOptionsPage
                    setActivePages={setActivePages}
                    settings={settings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              activePages.downloadType.downloadTypeOptions.active &&
              isDescendantActive(
                activePages.downloadType.downloadTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {downloadTypeOptions.map((option) => {
                    const activePage =
                      activePages.downloadType.downloadTypeOptions[
                        option as DownloadTypeOptionsTypes
                      ];
                    const activeSetting =
                      settings.downloadType.downloadTypeOptions[
                        option as DownloadTypeOptionsTypes
                      ];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={downloadTypeOptionsArrays[
                            option as DownloadTypeOptionsTypes
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

                                  newSettings.downloadType.downloadTypeOptions[
                                    option as DownloadTypeOptionsTypes
                                  ].value = type;

                                  return newSettings;
                                });
                              }}
                            />
                          ))}
                          pageTitle={
                            downloadTypeOptionsTitles[
                              option as DownloadTypeOptionsTypes
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.downloadType.downloadTypeOptions[
                                option as DownloadTypeOptionsTypes
                              ].active =
                                !newActivePages.downloadType
                                  .downloadTypeOptions[
                                  option as DownloadTypeOptionsTypes
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
