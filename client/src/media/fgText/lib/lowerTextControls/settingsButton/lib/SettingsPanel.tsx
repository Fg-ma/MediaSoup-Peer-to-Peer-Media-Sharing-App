import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../fgElements/fgButton/FgButton";
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

const SelectionPanelVar: Variants = {
  init: { opacity: 0 },
  animate: { opacity: 1 },
};

const SelectionPanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
  },
};

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
}: {
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

  // Function to check if a key or its descendants are active
  const isDescendantActive = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    setTimeout(() => getStaticPanelPosition(), 100);
  }, []);

  const getStaticPanelPosition = () => {
    const externalRect = settingsButtonRef?.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!externalRect || !settingsPanelRef.current) {
      return;
    }

    let bottom = viewportHeight - externalRect.top + 8;

    // Check if the panel overflows the top of the viewport
    if (bottom - settingsPanelRef.current.clientHeight < 0) {
      bottom = settingsPanelRef.current.clientHeight; // Adjust to fit within the top boundary of the viewport
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
      bottom,
      left,
    });
  };

  const handleDownloadTypeActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.active = !newActivePages.downloadType.active;

      return newActivePages;
    });
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className='max-h-80 w-64 absolute z-[99999999999999] flex p-2 h-max shadow-md rounded-md bg-black bg-opacity-75 font-K2D text-base text-white pointer-events-auto'
      style={{
        bottom: `${portalPosition?.bottom}px`,
        left: `${portalPosition?.left}px`,
      }}
      variants={SelectionPanelVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={SelectionPanelTransition}
    >
      <AnimatePresence>
        {!isDescendantActive(activePages) && (
          <motion.div
            className='flex w-full h-full flex-col justify-center items-center space-y-1 px-1'
            variants={panelVariants}
            initial='init'
            animate='animate'
            exit='exit'
          >
            <FgButton
              className='w-full'
              contentFunction={() => (
                <div className='flex w-full text-nowrap hover:bg-gray-400 justify-between px-2 rounded items-center'>
                  <div>Download</div>
                  <div>
                    {Object.prototype.hasOwnProperty.call(
                      downloadTypeSelections,
                      settings.downloadType.value
                    ) && downloadTypeSelections[settings.downloadType.value]}
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
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
          !isDescendantActive(activePages.downloadType.downloadTypeOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
          isDescendantActive(activePages.downloadType.downloadTypeOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
                          className={`w-full rounded bg-opacity-75 min-w-32 px-2 ${
                            type === activeSetting.value
                              ? "bg-gray-400"
                              : "hover:bg-gray-400"
                          }`}
                          contentFunction={() => (
                            <div className='flex justify-start items-start'>
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
                            !newActivePages.downloadType.downloadTypeOptions[
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
    </motion.div>,
    document.body
  );
}
