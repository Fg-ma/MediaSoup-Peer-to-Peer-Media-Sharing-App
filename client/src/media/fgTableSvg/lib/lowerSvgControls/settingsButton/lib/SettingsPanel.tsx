import React, { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { ActivePages } from "../../../typeConstant";
import LowerSvgController from "../../LowerSvgController";
import MimeTypePage from "./MimeTypePage";
import SizePage from "./SizePage";
import CompressionPage from "./CompressionPage";
import DownloadOptionsPage from "./DownloadOptionsPage";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import TableSvgMediaInstance from "../../../../TableSvgMediaInstance";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";

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
  lowerSvgController,
}: {
  svgMediaInstance: TableSvgMediaInstance;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  lowerSvgController: React.MutableRefObject<LowerSvgController>;
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

  const handleDownloadOptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.downloadOptions.active =
        !newActivePages.downloadOptions.active;

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
                        svgMediaInstance.settings.synced.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={
                          svgMediaInstance.settings.synced.value
                            ? desyncIcon
                            : syncIcon
                        }
                        className="flex mr-2 aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      {svgMediaInstance.settings.synced.value
                        ? "Desync"
                        : "Sync"}
                    </div>
                  )}
                  clickFunction={lowerSvgController.current.handleSync}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        svgMediaInstance.settings.synced.value
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
                        svgMediaInstance.settings.background.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={backgroundIcon}
                        className="flex mr-2 aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      Set as background
                    </div>
                  )}
                  clickFunction={
                    lowerSvgController.current.handleSetAsBackground
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
                {svgMediaInstance.svgMedia.fileSize < 1024 * 1024 && (
                  <FgButton
                    className="h-7 w-full"
                    contentFunction={() => (
                      <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                        <FgSVGElement
                          src={editIcon}
                          className="flex mr-2 aspect-square h-full items-center justify-center"
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
                      <FgHoverContentStandard
                        content="Edit (q)"
                        style="light"
                      />
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
                        className="flex mr-2 aspect-square h-full items-center justify-center"
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
                    <FgHoverContentStandard
                      content="Download (d)"
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
                    <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <FgSVGElement
                        src={copyIcon}
                        className="flex mr-2 aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "100%" },
                          { key: "height", value: "100%" },
                        ]}
                      />
                      Copy to clipboard
                    </div>
                  )}
                  clickFunction={
                    lowerSvgController.current.handleCopyToClipBoard
                  }
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
                    svgMediaInstance={svgMediaInstance}
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
                  svgMediaInstance={svgMediaInstance}
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
                  svgMediaInstance={svgMediaInstance}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }
    />
  );
}
