import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../fgButton/FgButton";
import PageTemplate from "./PageTemplate";
import {
  ActivePages,
  CaptureMediaTypes,
  downloadImageOptions,
  downloadImageOptionsArrays,
  downloadImageOptionsTitles,
  downloadVideoOptions,
  downloadVideoOptionsArrays,
  downloadVideoOptionsTitles,
  DownloadVideoOptionsTypes,
  Settings,
} from "../../typeConstant";
import DownloadVideoOptionsPage from "./DownloadVideoOptionsPage";
import VideoSpeedPage from "./VideoSpeedPage";
import CaptureMediaController from "../../CaptureMediaController";
import DelayPage from "./DelayPage";
import DownloadImageOptionsPage from "./DownloadImageOptionsPage";
import QualityPage from "./QualityPage";
import BitRatePage from "./BitRatePage";
import FgPortal from "../../../../fgPortal/FgPortal";

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
  captureMediaController,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
  finalizeCapture,
  mediaType,
}: {
  captureMediaController: CaptureMediaController;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  finalizeCapture: boolean;
  mediaType: React.MutableRefObject<CaptureMediaTypes>;
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

  const handleDownloadVideoOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadVideoOptions.active =
        !newActivePages.downloadVideoOptions.active;

      return newActivePages;
    });
  };

  const handleDownloadImageOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadImageOptions.active =
        !newActivePages.downloadImageOptions.active;

      return newActivePages;
    });
  };

  const handleVideoSpeedActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.videoSpeed.active = !newActivePages.videoSpeed.active;

      return newActivePages;
    });
  };

  const handleDelayActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.delay.active = !newActivePages.delay.active;

      return newActivePages;
    });
  };

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePages]);

  return (
    <FgPortal
      type="above"
      spacing={4}
      externalRef={settingsButtonRef}
      className="pointer-events-auto z-settings-panel flex h-max max-h-80 w-64 rounded-md border-2 border-fg-white bg-fg-tone-black-2 p-2 font-K2D text-base text-fg-white shadow-md shadow-fg-tone-black-8"
      externalPortalRef={settingsPanelRef}
      content={
        <>
          {/* Main page */}
          <AnimatePresence>
            {!isDescendantActive(activePages) && (
              <motion.div
                className="flex h-full w-full flex-col items-center justify-center space-y-1 px-1"
                variants={panelVariants}
                initial="init"
                animate="animate"
                exit="exit"
              >
                {!finalizeCapture && (
                  <FgButton
                    className="w-full"
                    contentFunction={() => (
                      <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                        <div>Delay</div>
                        <div>{`${settings.delay.value}s`}</div>
                      </div>
                    )}
                    clickFunction={handleDelayActive}
                  />
                )}
                {!finalizeCapture && (
                  <FgButton
                    className="w-full"
                    contentFunction={() => (
                      <div className="flex w-full items-center justify-start text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                        Download options
                      </div>
                    )}
                    clickFunction={
                      mediaType.current !== "camera"
                        ? handleDownloadVideoOptionsActive
                        : handleDownloadImageOptionsActive
                    }
                  />
                )}
                {finalizeCapture && (
                  <FgButton
                    className="w-full"
                    contentFunction={() => (
                      <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                        <div>Video speed</div>
                        <div>{`${parseFloat(
                          settings.videoSpeed.value.toFixed(2),
                        )}x`}</div>
                      </div>
                    )}
                    clickFunction={handleVideoSpeedActive}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Download video options page */}
          <AnimatePresence>
            {activePages.downloadVideoOptions.active &&
              !isDescendantActive(activePages.downloadVideoOptions) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadVideoOptionsPage
                    setActivePages={setActivePages}
                    settings={settings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {/* Download image options page */}
          <AnimatePresence>
            {activePages.downloadImageOptions.active &&
              !isDescendantActive(activePages.downloadImageOptions) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadImageOptionsPage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {/* Download video options option page */}
          <AnimatePresence>
            {activePages.downloadVideoOptions.active &&
              isDescendantActive(activePages.downloadVideoOptions) &&
              !activePages.downloadVideoOptions.bitRate.active && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {downloadVideoOptions.map((option) => {
                    const activePage =
                      activePages.downloadVideoOptions[
                        option as DownloadVideoOptionsTypes
                      ];
                    const activeSetting =
                      settings.downloadVideoOptions[
                        option as DownloadVideoOptionsTypes
                      ];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={downloadVideoOptionsArrays[
                            option as DownloadVideoOptionsTypes
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

                                  newSettings.downloadVideoOptions[
                                    option as DownloadVideoOptionsTypes
                                  ].value = type;

                                  return newSettings;
                                });
                              }}
                            />
                          ))}
                          pageTitle={
                            downloadVideoOptionsTitles[
                              option as DownloadVideoOptionsTypes
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.downloadVideoOptions[
                                option as DownloadVideoOptionsTypes
                              ].active =
                                !newActivePages.downloadVideoOptions[
                                  option as DownloadVideoOptionsTypes
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
          {/* Download video options bit rate page */}
          <AnimatePresence>
            {activePages.downloadVideoOptions.active &&
              isDescendantActive(activePages.downloadVideoOptions) &&
              activePages.downloadVideoOptions.bitRate.active && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <BitRatePage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {/* Download image options option page */}
          <AnimatePresence>
            {activePages.downloadImageOptions.active &&
              isDescendantActive(activePages.downloadImageOptions) &&
              !activePages.downloadImageOptions.quality.active && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {downloadImageOptions.map((option) => {
                    const activePage = activePages.downloadImageOptions[option];
                    const activeSetting = settings.downloadImageOptions[option];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={downloadImageOptionsArrays[option].map(
                            (type) => (
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

                                    newSettings.downloadImageOptions[
                                      option
                                    ].value = type;

                                    return newSettings;
                                  });
                                }}
                              />
                            ),
                          )}
                          pageTitle={downloadImageOptionsTitles[option]}
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.downloadImageOptions[
                                option
                              ].active =
                                !newActivePages.downloadImageOptions[option]
                                  .active;

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
          {/* Download image options quality page */}
          <AnimatePresence>
            {activePages.downloadImageOptions.active &&
              isDescendantActive(activePages.downloadImageOptions) &&
              activePages.downloadImageOptions.quality.active && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <QualityPage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {/* Video speed page */}
          <AnimatePresence>
            {activePages.videoSpeed.active &&
              !isDescendantActive(activePages.videoSpeed) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <VideoSpeedPage
                    captureMediaController={captureMediaController}
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {/* Delay page */}
          <AnimatePresence>
            {activePages.delay.active &&
              !isDescendantActive(activePages.delay) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DelayPage
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                  />
                </motion.div>
              )}
          </AnimatePresence>
        </>
      }
    />
  );
}
