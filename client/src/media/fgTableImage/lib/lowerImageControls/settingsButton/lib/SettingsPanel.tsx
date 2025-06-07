import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import {
  ActivePages,
  downloadTypeSelections,
  downloadRecordingTypeOptionsArrays,
  downloadRecordTypeOptionsTitles,
  downloadSnapShotTypeOptions,
  DownloadSnapShotTypeOptionsTypes,
  downloadSnapShotTypeOptionsArrays,
  downloadSnapShotTypeOptionsTitles,
  downloadRecordTypeOptions,
  DownloadRecordTypeOptionsTypes,
} from "../../../typeConstant";
import DownloadTypePage from "./DownloadTypePage";
import DownloadTypeOptionsPage from "./DownloadTypeOptionsPage";
import PageTemplate from "./PageTemplate";
import LowerImageController from "../../LowerImageController";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";
import FgSlider from "../../../../../../elements/fgSlider/FgSlider";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";

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
  imageMediaInstance,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  lowerImageController,
}: {
  imageMediaInstance: TableImageMediaInstance;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  lowerImageController: React.MutableRefObject<LowerImageController>;
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
  }, [JSON.stringify(activePages)]);

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
                        imageMediaInstance.settings.synced.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={
                          imageMediaInstance.settings.synced.value
                            ? desyncIcon
                            : syncIcon
                        }
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      {imageMediaInstance.settings.synced.value
                        ? "Desync"
                        : "Sync"}
                    </div>
                  )}
                  clickFunction={lowerImageController.current.handleSync}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        imageMediaInstance.settings.synced.value
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
                        imageMediaInstance.settings.background.value
                          ? "bg-fg-white text-fg-tone-black-1"
                          : ""
                      } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                    >
                      Set as background (b)
                    </div>
                  )}
                  clickFunction={
                    lowerImageController.current.handleSetAsBackground
                  }
                />
                <FgButton
                  className="h-7 w-full"
                  contentFunction={() => (
                    <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <FgSVGElement
                        src={editIcon}
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      Edit
                    </div>
                  )}
                  clickFunction={lowerImageController.current.handleEdit}
                  hoverContent={
                    <FgHoverContentStandard content="Edit (m)" style="light" />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 3500,
                    hoverType: "above",
                  }}
                />
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                      <div>Download</div>
                      <div>
                        {Object.prototype.hasOwnProperty.call(
                          downloadTypeSelections,
                          imageMediaInstance.settings.downloadType.value,
                        ) &&
                          downloadTypeSelections[
                            imageMediaInstance.settings.downloadType.value
                          ]}
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
                    imageMediaInstance={imageMediaInstance}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              activePages.downloadType.downloadRecordTypeOptions.active &&
              !isDescendantActive(
                activePages.downloadType.downloadRecordTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadTypeOptionsPage
                    imageMediaInstance={imageMediaInstance}
                    activePages={activePages}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              activePages.downloadType.downloadRecordTypeOptions.active &&
              isDescendantActive(
                activePages.downloadType.downloadRecordTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {downloadRecordTypeOptions.map((option) => {
                    const activePage =
                      activePages.downloadType.downloadRecordTypeOptions[
                        option as DownloadRecordTypeOptionsTypes
                      ];
                    const activeSetting =
                      imageMediaInstance.settings.downloadType
                        .downloadRecordTypeOptions[
                        option as DownloadRecordTypeOptionsTypes
                      ];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={downloadRecordingTypeOptionsArrays[
                            option as DownloadRecordTypeOptionsTypes
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
                                imageMediaInstance.settings.downloadType.downloadRecordTypeOptions[
                                  option as DownloadRecordTypeOptionsTypes
                                ].value = type;

                                setRerender((prev) => !prev);
                              }}
                            />
                          ))}
                          pageTitle={
                            downloadRecordTypeOptionsTitles[
                              option as DownloadRecordTypeOptionsTypes
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.downloadType.downloadRecordTypeOptions[
                                option as DownloadRecordTypeOptionsTypes
                              ].active =
                                !newActivePages.downloadType
                                  .downloadRecordTypeOptions[
                                  option as DownloadRecordTypeOptionsTypes
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
              activePages.downloadType.downloadSnapShotTypeOptions.active &&
              !isDescendantActive(
                activePages.downloadType.downloadSnapShotTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <DownloadTypeOptionsPage
                    imageMediaInstance={imageMediaInstance}
                    activePages={activePages}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.downloadType.active &&
              activePages.downloadType.downloadSnapShotTypeOptions.active &&
              isDescendantActive(
                activePages.downloadType.downloadSnapShotTypeOptions,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {downloadSnapShotTypeOptions.map((option) => {
                    const activePage =
                      activePages.downloadType.downloadSnapShotTypeOptions[
                        option as DownloadSnapShotTypeOptionsTypes
                      ];
                    const activeSetting =
                      imageMediaInstance.settings.downloadType
                        .downloadSnapShotTypeOptions[
                        option as DownloadSnapShotTypeOptionsTypes
                      ];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={
                            <>
                              {option === "quality" && (
                                <FgSlider
                                  className="h-10"
                                  externalValue={
                                    imageMediaInstance.settings.downloadType
                                      .downloadSnapShotTypeOptions.quality.value
                                  }
                                  externalStyleValue={
                                    imageMediaInstance.settings.downloadType
                                      .downloadSnapShotTypeOptions.quality.value
                                  }
                                  onValueChange={(value) => {
                                    imageMediaInstance.settings.downloadType.downloadSnapShotTypeOptions.quality.value =
                                      value.value;
                                    setRerender((prev) => !prev);
                                  }}
                                  options={{
                                    initValue:
                                      imageMediaInstance.settings.downloadType
                                        .downloadSnapShotTypeOptions.quality
                                        .value,
                                    ticks: 6,
                                    rangeMax: 1,
                                    rangeMin: 0,
                                    orientation: "horizontal",
                                    tickLabels: false,
                                    precision: 2,
                                  }}
                                />
                              )}
                              {downloadSnapShotTypeOptionsArrays[
                                option as DownloadSnapShotTypeOptionsTypes
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
                                    imageMediaInstance.settings.downloadType.downloadSnapShotTypeOptions[
                                      option as DownloadSnapShotTypeOptionsTypes
                                    ].value = type;

                                    setRerender((prev) => !prev);
                                  }}
                                />
                              ))}
                            </>
                          }
                          pageTitle={
                            downloadSnapShotTypeOptionsTitles[
                              option as DownloadSnapShotTypeOptionsTypes
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.downloadType.downloadSnapShotTypeOptions[
                                option as DownloadSnapShotTypeOptionsTypes
                              ].active =
                                !newActivePages.downloadType
                                  .downloadSnapShotTypeOptions[
                                  option as DownloadSnapShotTypeOptionsTypes
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
