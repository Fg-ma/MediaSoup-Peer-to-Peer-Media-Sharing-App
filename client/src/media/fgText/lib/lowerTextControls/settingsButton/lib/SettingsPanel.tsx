import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { Settings, ActivePages } from "../../../typeConstant";
import ColorsPage from "./ColorsPage";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FontStylePage from "./FontStylePage";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetSeverBaseUrl + "svgs/minusIcon.svg";

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

  const handleColorsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.colors.active = !newActivePages.colors.active;

      return newActivePages;
    });
  };

  const handleSetAsBackground = () => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      if (newSettings.background.value === "true") {
        newSettings.background.value = "false";
      } else {
        newSettings.background.value = "true";
      }

      return newSettings;
    });
  };

  const handleFontStyleActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.fontStyle.active = !newActivePages.fontStyle.active;

      return newActivePages;
    });
  };

  const handleFontSizeChange = (
    type: "increment" | "decrement" | "value",
    value: number
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
      className='flex max-h-80 w-64 absolute z-10 p-2 h-max shadow-md rounded-md bg-fg-tone-black-1 font-K2D text-base text-white pointer-events-auto'
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
            <FgButton
              className='w-full h-7'
              contentFunction={() => (
                <div
                  className={`${
                    settings.background.value === "true"
                      ? "bg-fg-white text-fg-tone-black-1"
                      : ""
                  } flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center text-lg`}
                >
                  Set as background
                </div>
              )}
              clickFunction={handleSetAsBackground}
            />
            <FgButton
              className='w-full h-7'
              contentFunction={() => (
                <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center text-lg'>
                  Colors
                </div>
              )}
              clickFunction={handleColorsActive}
            />
            <div className='flex w-full h-7 items-center justify-between'>
              <div className='flex w-max text-nowrap justify-start px-2 rounded items-center text-lg'>
                Font size
              </div>
              <div className='flex w-max h-full items-center justify-center space-x-1'>
                <FgButton
                  className='h-full'
                  clickFunction={() => handleFontSizeChange("increment", 1)}
                  contentFunction={() => (
                    <FgSVG
                      src={additionIcon}
                      className='h-full aspect-square'
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "white" },
                        { key: "stroke", value: "white" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content='Increase' style='light' />
                  }
                  options={{
                    hoverType: "above",
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 2500,
                  }}
                />
                <input
                  type='text'
                  className='flex h-full w-12 font-K2D bg-transparent focus:outline-none text-center text-xl'
                  value={settings.fontSize.value.slice(0, -2)}
                  onChange={(event) => {
                    const inputValue = event.target.value;
                    const parsedValue =
                      inputValue.trim() !== "" && !isNaN(Number(inputValue))
                        ? parseInt(inputValue, 10)
                        : 1;

                    handleFontSizeChange("value", parsedValue);
                  }}
                  placeholder='Size...'
                />
                <FgButton
                  className='h-full'
                  clickFunction={() => handleFontSizeChange("decrement", 1)}
                  contentFunction={() => (
                    <FgSVG
                      src={minusIcon}
                      className='h-full aspect-square'
                      attributes={[
                        { key: "width", value: "100%" },
                        { key: "height", value: "100%" },
                        { key: "fill", value: "white" },
                        { key: "stroke", value: "white" },
                      ]}
                    />
                  )}
                  hoverContent={
                    <FgHoverContentStandard content='Decrease' style='light' />
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
              className='w-full h-7'
              contentFunction={() => (
                <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-start px-2 rounded items-center text-lg'>
                  Font style
                </div>
              )}
              clickFunction={handleFontStyleActive}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.colors.active &&
          !isDescendantActive(activePages.colors) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
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
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              <FontStylePage
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
