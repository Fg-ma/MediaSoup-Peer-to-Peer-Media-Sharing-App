import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import PageTemplate from "./PageTemplate";
import {
  ActivePages,
  CaptureMediaTypes,
  downloadImageOptions,
  downloadImageOptionsArrays,
  downloadImageOptionsTitles,
  DownloadImageOptionsTypes,
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
  mediaType: CaptureMediaTypes;
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

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className='max-h-80 w-64 absolute z-[99999999999999] flex p-2 h-max shadow-md rounded-md bg-fg-tone-black-2 font-K2D text-base text-white pointer-events-auto'
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
            {!finalizeCapture && (
              <FgButton
                className='w-full'
                contentFunction={() => (
                  <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-between px-2 rounded items-center'>
                    <div>Delay</div>
                    <div>{`${settings.delay.value}s`}</div>
                  </div>
                )}
                clickFunction={handleDelayActive}
              />
            )}
            {!finalizeCapture && (
              <FgButton
                className='w-full'
                contentFunction={() => (
                  <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center'>
                    Download options
                  </div>
                )}
                clickFunction={
                  mediaType !== "camera"
                    ? handleDownloadVideoOptionsActive
                    : handleDownloadImageOptionsActive
                }
              />
            )}
            {finalizeCapture && (
              <FgButton
                className='w-full'
                contentFunction={() => (
                  <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-between px-2 rounded items-center'>
                    <div>Video speed</div>
                    <div>{`${parseFloat(
                      settings.videoSpeed.value.toFixed(2)
                    )}x`}</div>
                  </div>
                )}
                clickFunction={handleVideoSpeedActive}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.downloadVideoOptions.active &&
          !isDescendantActive(activePages.downloadVideoOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              <DownloadVideoOptionsPage
                setActivePages={setActivePages}
                settings={settings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.downloadImageOptions.active &&
          !isDescendantActive(activePages.downloadImageOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              <DownloadImageOptionsPage
                setActivePages={setActivePages}
                settings={settings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.downloadVideoOptions.active &&
          isDescendantActive(activePages.downloadVideoOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
                          className={`w-full rounded bg-opacity-75 min-w-32 px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                            type === activeSetting.value
                              ? "bg-fg-white text-fg-tone-black-1"
                              : ""
                          }`}
                          contentFunction={() => (
                            <div className='flex justify-start items-start'>
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
      <AnimatePresence>
        {activePages.downloadImageOptions.active &&
          isDescendantActive(activePages.downloadImageOptions) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              {downloadImageOptions.map((option) => {
                const activePage =
                  activePages.downloadImageOptions[
                    option as DownloadImageOptionsTypes
                  ];
                const activeSetting =
                  settings.downloadImageOptions[
                    option as DownloadImageOptionsTypes
                  ];

                return (
                  activePage.active && (
                    <PageTemplate
                      key={option}
                      content={downloadImageOptionsArrays[
                        option as DownloadImageOptionsTypes
                      ].map((type) => (
                        <FgButton
                          key={type}
                          className={`w-full rounded bg-opacity-75 min-w-32 px-2 hover:bg-fg-white hover:text-fg-tone-black-1 ${
                            type === activeSetting.value
                              ? "bg-fg-white text-fg-tone-black-1"
                              : ""
                          }`}
                          contentFunction={() => (
                            <div className='flex justify-start items-start'>
                              {type}
                            </div>
                          )}
                          clickFunction={() => {
                            setSettings((prev) => {
                              const newSettings = { ...prev };

                              newSettings.downloadImageOptions[
                                option as DownloadImageOptionsTypes
                              ].value = type;

                              return newSettings;
                            });
                          }}
                        />
                      ))}
                      pageTitle={
                        downloadImageOptionsTitles[
                          option as DownloadImageOptionsTypes
                        ]
                      }
                      backFunction={() => {
                        setActivePages((prev) => {
                          const newActivePages = { ...prev };

                          newActivePages.downloadImageOptions[
                            option as DownloadImageOptionsTypes
                          ].active =
                            !newActivePages.downloadImageOptions[
                              option as DownloadImageOptionsTypes
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
      <AnimatePresence>
        {activePages.videoSpeed.active &&
          !isDescendantActive(activePages.videoSpeed) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
      <AnimatePresence>
        {activePages.delay.active && !isDescendantActive(activePages.delay) && (
          <motion.div
            className='w-full'
            variants={panelVariants}
            initial='init'
            animate='animate'
            exit='exit'
          >
            <DelayPage
              setActivePages={setActivePages}
              settings={settings}
              setSettings={setSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
