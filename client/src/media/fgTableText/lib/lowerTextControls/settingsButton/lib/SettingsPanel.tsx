import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { Settings, ActivePages } from "../../../typeConstant";
import ColorsPage from "./ColorsPage";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FontStylePage from "./FontStylePage";
import LowerTextController from "../../LowerTextController";
import CursorStylePage from "./CursorStylePage";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const mapIcon = nginxAssetServerBaseUrl + "svgs/mapIcon.svg";
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
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
  externalColorPickerPanelRefs,
  lowerTextController,
  isReadOnly,
}: {
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  externalColorPickerPanelRefs: {
    backgroundColor: React.RefObject<HTMLDivElement>;
    textColor: React.RefObject<HTMLDivElement>;
    indexColor: React.RefObject<HTMLDivElement>;
  };
  lowerTextController: React.MutableRefObject<LowerTextController>;
  isReadOnly: React.MutableRefObject<boolean>;
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

  const handleColorsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.colors.active = !newActivePages.colors.active;

      return newActivePages;
    });
  };

  const handleFontStyleActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.fontStyle.active = !newActivePages.fontStyle.active;

      return newActivePages;
    });
  };

  const handleCursorStyleActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.cursorStyle.active = !newActivePages.cursorStyle.active;

      return newActivePages;
    });
  };

  const handleFontSizeChange = (
    type: "increment" | "decrement" | "value",
    value: number,
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      const currentValue = parseInt(newSettings.fontSize.value.slice(0, -2));

      if (type === "increment") {
        newSettings.fontSize.value = `${currentValue + value}px`;
      } else if (type === "decrement") {
        newSettings.fontSize.value = `${Math.max(1, currentValue - value)}px`;
      } else {
        newSettings.fontSize.value = `${Math.max(1, value)}px`;
      }

      return newSettings;
    });
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className="flex pointer-events-auto absolute z-settings-panel h-max max-h-80 w-64 rounded-md bg-fg-tone-black-1 p-2 font-K2D text-base text-white shadow-md"
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
                    className="flex mr-2 aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "80%" },
                      { key: "height", value: "80%" },
                    ]}
                  />
                  {settings.synced.value ? "Desync" : "Sync"}
                </div>
              )}
              clickFunction={lowerTextController.current.handleSync}
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
                    className="flex mr-2 aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "80%" },
                      { key: "height", value: "80%" },
                    ]}
                  />
                  Set as background
                </div>
              )}
              clickFunction={lowerTextController.current.handleSetAsBackground}
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
                <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                  <FgSVGElement
                    src={editIcon}
                    className="flex mr-2 aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "80%" },
                      { key: "height", value: "80%" },
                    ]}
                  />
                  {isReadOnly.current ? "Edit" : "Stop editing"}
                </div>
              )}
              clickFunction={lowerTextController.current.handleEdit}
              hoverContent={
                <FgHoverContentStandard
                  content={isReadOnly.current ? "Edit (e)" : "Stop editing (e)"}
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
                    src={mapIcon}
                    className="flex mr-2 aspect-square h-full items-center justify-center"
                    attributes={[
                      { key: "width", value: "80%" },
                      { key: "height", value: "80%" },
                    ]}
                  />
                  {settings.minimap.value ? "Open minimap" : "Close minimap"}
                </div>
              )}
              clickFunction={lowerTextController.current.handleMinimap}
              hoverContent={
                <FgHoverContentStandard
                  content={
                    settings.minimap.value
                      ? "Open minimap (m)"
                      : "Open minimap (m)"
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
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1">
                  Colors
                </div>
              )}
              clickFunction={handleColorsActive}
            />
            <div className="flex h-7 w-full items-center justify-between">
              <div className="flex w-max items-center justify-start text-nowrap rounded px-2 text-lg">
                Font size
              </div>
              <div className="flex h-full w-max items-center justify-center space-x-1">
                <FgButton
                  className="h-full"
                  clickFunction={() => handleFontSizeChange("increment", 1)}
                  contentFunction={() => (
                    <FgSVGElement
                      src={additionIcon}
                      className="aspect-square h-full"
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "#f2f2f2" },
                        { key: "stroke", value: "#f2f2f2" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content="Increase" style="light" />
                  }
                  options={{
                    hoverType: "above",
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 2500,
                  }}
                />
                <input
                  type="text"
                  className="flex h-full w-12 bg-transparent text-center font-K2D text-xl focus:outline-none"
                  value={settings.fontSize.value.slice(0, -2)}
                  onChange={(event) => {
                    const inputValue = event.target.value;
                    const parsedValue =
                      inputValue.trim() !== "" && !isNaN(Number(inputValue))
                        ? parseInt(inputValue, 10)
                        : 1;

                    handleFontSizeChange("value", parsedValue);
                  }}
                  placeholder="Size..."
                />
                <FgButton
                  className="h-full"
                  clickFunction={() => handleFontSizeChange("decrement", 1)}
                  contentFunction={() => (
                    <FgSVGElement
                      src={minusIcon}
                      className="aspect-square h-full"
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "#f2f2f2" },
                        { key: "stroke", value: "#f2f2f2" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content="Decrease" style="light" />
                  }
                  options={{
                    hoverType: "above",
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 2500,
                  }}
                />
              </div>
            </div>
            <FgButton
              className="h-7 w-full"
              contentFunction={() => (
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1">
                  Font style
                </div>
              )}
              clickFunction={handleFontStyleActive}
            />
            <FgButton
              className="h-7 w-full"
              contentFunction={() => (
                <div className="flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1">
                  Cursor
                </div>
              )}
              clickFunction={handleCursorStyleActive}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.colors.active &&
          !isDescendantActive(activePages.colors) && (
            <motion.div
              className="w-full"
              variants={panelVariants}
              initial="init"
              animate="animate"
              exit="exit"
            >
              <ColorsPage
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
                externalColorPickerPanelRefs={externalColorPickerPanelRefs}
              />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.fontStyle.active &&
          !isDescendantActive(activePages.fontStyle) && (
            <motion.div
              className="w-full"
              variants={panelVariants}
              initial="init"
              animate="animate"
              exit="exit"
            >
              <FontStylePage
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.cursorStyle.active &&
          !isDescendantActive(activePages.cursorStyle) && (
            <motion.div
              className="w-full"
              variants={panelVariants}
              initial="init"
              animate="animate"
              exit="exit"
            >
              <CursorStylePage
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
