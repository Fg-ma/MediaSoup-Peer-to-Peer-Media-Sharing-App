import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./ClosedCaptionsPage";
import ClosedCaptionsOptionsPage, {
  closedCaptionsOptionsArrays,
} from "./ClosedCaptionsOptionsPage";
import PageTemplate from "./PageTemplate";
import {
  ActivePages,
  downloadTypeOptions,
  downloadTypeOptionsArrays,
  downloadTypeOptionsTitles,
  DownloadTypeOptionsTypes,
  downloadTypeSelections,
} from "../../../typeConstant";
import DownloadTypePage from "./DownloadTypePage";
import DownloadTypeOptionsPage from "./DownloadTypeOptionsPage";
import VideoSpeedPage from "./VideoSpeedPage";
import LowerVideoController from "../../LowerVideoController";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";
import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

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
  videoMediaInstance,
  lowerVideoController,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
}: {
  videoMediaInstance: TableVideoMediaInstance;
  lowerVideoController: React.MutableRefObject<LowerVideoController>;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
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

  const handleDownloadTypeActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadType.active = !newActivePages.downloadType.active;

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

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePages]);

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
                        videoMediaInstance.settings.synced.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={
                          videoMediaInstance.settings.synced.value
                            ? desyncIcon
                            : syncIcon
                        }
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      {videoMediaInstance.settings.synced.value
                        ? "Desync"
                        : "Sync"}
                    </div>
                  )}
                  clickFunction={lowerVideoController.current.handleSync}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        videoMediaInstance.settings.synced.value
                          ? "Desync (h)"
                          : "Sync (h)"
                      }
                      style="light"
                    />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 3500,
                    hoverType: "above",
                  }}
                />
                <FgButton
                  className="h-7 w-full"
                  contentFunction={() => (
                    <div
                      className={`${
                        videoMediaInstance.settings.background.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={backgroundIcon}
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      Set as background
                    </div>
                  )}
                  clickFunction={
                    lowerVideoController.current.handleSetAsBackground
                  }
                  hoverContent={
                    <FgHoverContentStandard
                      content="Set as background (b)"
                      style="light"
                    />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 3500,
                    hoverType: "above",
                  }}
                />
                <FgButton
                  className="h-7 w-full"
                  contentFunction={() => (
                    <div className="flex h-full w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div className="flex h-full items-center justify-center">
                        <FgSVGElement
                          src={downloadIcon}
                          className="mr-2 flex aspect-square h-full items-center justify-center"
                          attributes={[
                            { key: "width", value: "85%" },
                            { key: "height", value: "85%" },
                          ]}
                        />
                        Download
                      </div>
                      <div className="flex space-x-1">
                        {
                          downloadTypeSelections[
                            videoMediaInstance.settings.downloadType.value
                          ]
                        }
                        <FgSVGElement
                          src={navigateForwardIcon}
                          attributes={[
                            { key: "width", value: "1.25rem" },
                            { key: "height", value: "1.25rem" },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                  clickFunction={handleDownloadTypeActive}
                />
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div>Video speed</div>
                      <div className="flex space-x-1">
                        {`${parseFloat(
                          videoMediaInstance.settings.videoSpeed.value.toFixed(
                            2,
                          ),
                        )}x`}
                        <FgSVGElement
                          src={navigateForwardIcon}
                          attributes={[
                            { key: "width", value: "1.25rem" },
                            { key: "height", value: "1.25rem" },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                  clickFunction={handleVideoSpeedActive}
                />
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div>Subtitles</div>
                      <div className="flex space-x-1">
                        {
                          closedCaptionsSelections[
                            videoMediaInstance.settings.closedCaption.value
                          ]
                        }
                        <FgSVGElement
                          src={navigateForwardIcon}
                          attributes={[
                            { key: "width", value: "1.25rem" },
                            { key: "height", value: "1.25rem" },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                  clickFunction={handleClosedCaptionsActive}
                />
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
                    videoMediaInstance={videoMediaInstance}
                    setActivePages={setActivePages}
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
                    videoMediaInstance={videoMediaInstance}
                    setActivePages={setActivePages}
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
                      videoMediaInstance.settings.closedCaption
                        .closedCaptionOptions[option as ClosedCaptionOptions];

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
                                videoMediaInstance.settings.closedCaption.closedCaptionOptions[
                                  option as ClosedCaptionOptions
                                ].value = type;

                                setRerender((prev) => !prev);
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
                    videoMediaInstance={videoMediaInstance}
                    setActivePages={setActivePages}
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
                    videoMediaInstance={videoMediaInstance}
                    setActivePages={setActivePages}
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
                      videoMediaInstance.settings.downloadType
                        .downloadTypeOptions[
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
                                videoMediaInstance.settings.downloadType.downloadTypeOptions[
                                  option as DownloadTypeOptionsTypes
                                ].value = type;

                                setRerender((prev) => !prev);
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
                    videoMediaInstance={videoMediaInstance}
                    lowerVideoController={lowerVideoController}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
        </>
      }
    />
  );
}
