import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
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

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";

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
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    bottom: number;
  } | null>(null);
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
      className="pointer-events-auto absolute z-settings-panel flex h-max max-h-80 w-64 rounded-md bg-black p-2 font-K2D text-base text-white shadow-md"
      style={{
        bottom: `${portalPosition?.bottom}px`,
        left: `${portalPosition?.left}px`,
      }}
      variants={SelectionPanelVar}
      initial="init"
      animate="animate"
      exit="init"
      transition={SelectionPanelTransition}
    >
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
                  {imageMediaInstance.settings.synced.value ? "Desync" : "Sync"}
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
              clickFunction={lowerImageController.current.handleSetAsBackground}
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
          !isDescendantActive(activePages.downloadType.downloadTypeOptions) && (
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
          isDescendantActive(activePages.downloadType.downloadTypeOptions) && (
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
                  imageMediaInstance.settings.downloadType.downloadTypeOptions[
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
    document.body,
  );
}
