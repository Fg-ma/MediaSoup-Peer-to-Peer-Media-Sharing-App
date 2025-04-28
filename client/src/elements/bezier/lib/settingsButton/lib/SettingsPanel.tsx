import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../elements/fgButton/FgButton";
import { ActivePages, BezierColorTypes, Settings } from "../../typeConstant";
import DownloadOptionsPage from "./DownloadOptionsPage";
import ColorPickerButton from "../../../../../elements/colorPickerButton/ColorPickerButton";
import MimeTypePage from "./MimeTypePage";
import SizePage from "./SizePage";
import CompressionPage from "./CompressionPage";
import FiltersPage from "./FiltersPage";

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
  colorPickerRefs,
}: {
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  colorPickerRefs: {
    [bezierColorType in BezierColorTypes]: React.RefObject<HTMLDivElement>;
  };
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

  const handleFiltersActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.filters.active = !newActivePages.filters.active;

      return newActivePages;
    });
  };

  const handleAcceptColor = (
    colorType: "backgroundColor" | "color",
    color: string,
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings[colorType].value = color;

      return newSettings;
    });
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className="z-settings-panel pointer-events-auto absolute flex h-max max-h-80 w-64 rounded-md bg-fg-tone-black-2 p-2 font-K2D text-base text-white shadow-md"
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
            <div className="flex w-full items-center justify-between text-nowrap rounded px-2">
              <div>Background color</div>
              <ColorPickerButton
                externalColorPickerPanelRef={colorPickerRefs.backgroundColor}
                className="aspect-square h-6"
                defaultColor={settings.backgroundColor.value}
                handleAcceptColorCallback={(_hex, hexa) =>
                  handleAcceptColor("backgroundColor", hexa)
                }
                isAlpha={true}
              />
            </div>
            <div className="flex w-full items-center justify-between text-nowrap rounded px-2">
              <div>Color</div>
              <ColorPickerButton
                externalColorPickerPanelRef={colorPickerRefs.color}
                className="aspect-square h-6"
                defaultColor={settings.color.value}
                handleAcceptColorCallback={(_hex, hexa) =>
                  handleAcceptColor("color", hexa)
                }
                isAlpha={true}
              />
            </div>
            <FgButton
              className="w-full"
              contentFunction={() => (
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                  Filters
                </div>
              )}
              clickFunction={handleFiltersActive}
            />
            <FgButton
              className="w-full"
              contentFunction={() => (
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                  Download options
                </div>
              )}
              clickFunction={handleDownloadOptionsActive}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Filters page */}
      <AnimatePresence>
        {activePages.filters.active &&
          !isDescendantActive(activePages.filters) && (
            <motion.div
              className="w-full"
              variants={panelVariants}
              initial="init"
              animate="animate"
              exit="exit"
            >
              <FiltersPage
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
                colorPickerRefs={colorPickerRefs}
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
