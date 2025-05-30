import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { Settings, ActivePages } from "../../../typeConstant";
import LowerSvgController from "../../LowerSvgController";
import MimeTypePage from "./MimeTypePage";
import SizePage from "./SizePage";
import CompressionPage from "./CompressionPage";
import DownloadOptionsPage from "./DownloadOptionsPage";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import TableSvgMediaInstance from "../../../../TableSvgMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";

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
  svgMediaInstance,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
  lowerSvgController,
}: {
  svgMediaInstance: TableSvgMediaInstance;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  lowerSvgController: React.MutableRefObject<LowerSvgController>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

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

  const handleDownloadOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.active =
        !newActivePages.downloadOptions.active;

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
                    settings.synced.value
                      ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                      : "fill-fg-white stroke-fg-white"
                  } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                >
                  <FgSVGElement
                    src={settings.synced.value ? desyncIcon : syncIcon}
                    className="mr-2 flex aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "80%" },
                      { key: "height", value: "80%" },
                    ]}
                  />
                  {settings.synced.value ? "Desync" : "Sync"}
                </div>
              )}
              clickFunction={lowerSvgController.current.handleSync}
              hoverContent={
                <FgHoverContentStandard
                  content={settings.synced.value ? "Desync (h)" : "Sync (h)"}
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
                    settings.background.value
                      ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                      : "fill-fg-white stroke-fg-white"
                  } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
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
              clickFunction={lowerSvgController.current.handleSetAsBackground}
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
            {svgMediaInstance.svgMedia.fileSize < 1024 * 1024 && (
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
                clickFunction={lowerSvgController.current.handleEdit}
                hoverContent={
                  <FgHoverContentStandard content="Edit (q)" style="light" />
                }
                options={{
                  hoverSpacing: 4,
                  hoverTimeoutDuration: 3500,
                  hoverType: "above",
                }}
              />
            )}
            <FgButton
              className="h-7 w-full"
              contentFunction={() => (
                <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
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
              )}
              clickFunction={lowerSvgController.current.handleDownload}
              hoverContent={
                <FgHoverContentStandard content="Download (d)" style="light" />
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
                <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                  <FgSVGElement
                    src={copyIcon}
                    className="mr-2 flex aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "100%" },
                      { key: "height", value: "100%" },
                    ]}
                  />
                  Copy to clipboard
                </div>
              )}
              clickFunction={lowerSvgController.current.handleCopyToClipBoard}
              hoverContent={
                <FgHoverContentStandard
                  content="Copy to clipboard (c)"
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
              className="w-full"
              contentFunction={() => (
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1">
                  Download options
                </div>
              )}
              clickFunction={handleDownloadOptionsActive}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Download options page */}
      <AnimatePresence>
        {activePages.downloadOptions.active &&
          !isDescendantActive(activePages.downloadOptions) && (
            <motion.div
              className="w-full"
              variants={panelVariants}
              initial="init"
              animate="animate"
              exit="exit"
            >
              <DownloadOptionsPage
                setActivePages={setActivePages}
                settings={settings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      {/* Download options mime type page */}
      <AnimatePresence>
        {activePages.downloadOptions.mimeType.active && (
          <motion.div
            className="w-full"
            variants={panelVariants}
            initial="init"
            animate="animate"
            exit="exit"
          >
            <MimeTypePage
              setActivePages={setActivePages}
              settings={settings}
              setSettings={setSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Download options size page */}
      <AnimatePresence>
        {activePages.downloadOptions.size.active && (
          <motion.div
            className="w-full"
            variants={panelVariants}
            initial="init"
            animate="animate"
            exit="exit"
          >
            <SizePage
              svgMediaInstance={svgMediaInstance}
              setActivePages={setActivePages}
              settings={settings}
              setSettings={setSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Download options compression page */}
      <AnimatePresence>
        {activePages.downloadOptions.compression.active && (
          <motion.div
            className="w-full"
            variants={panelVariants}
            initial="init"
            animate="animate"
            exit="exit"
          >
            <CompressionPage
              setActivePages={setActivePages}
              settings={settings}
              setSettings={setSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
