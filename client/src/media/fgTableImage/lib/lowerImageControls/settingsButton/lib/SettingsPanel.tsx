import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import {
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
import LowerImageController from "../../LowerImageController";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

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
  }, [activePages]);

  return (
    <FgPortal
      type="above"
      spacing={4}
      externalRef={settingsButtonRef}
      className="flex pointer-events-auto z-settings-panel h-max max-h-80 w-64 rounded-md border-2 border-fg-white bg-fg-tone-black-1 p-2 font-K2D text-base text-fg-white shadow-md shadow-fg-tone-black-8"
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
                        className="flex mr-2 aspect-square h-full items-center justify-center"
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
                    imageMediaInstance={imageMediaInstance}
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
                      imageMediaInstance.settings.downloadType
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
                                imageMediaInstance.settings.downloadType.downloadTypeOptions[
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
        </>
      }
    />
  );
}
