import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../elements/fgButton/FgButton";
import {
  Settings,
  ActivePages,
  envelopeTypesTitles,
  colorSettingsTitles,
  ColorSettingsTypes,
  EnvelopeOptionTypes,
  envelopeTypesSliderOptions,
  muteStylesMeta,
} from "../../typeConstant";
import EnvelopeTypePage from "./EnvelopeTypePage";
import MuteStylePage from "./MuteStylePage";
import ColorPickerButton from "../../../../../elements/colorPickerButton/ColorPickerButton";
import FgInput from "../../../../../elements/fgInput/FgInput";
import PageTemplate from "./PageTemplate";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";

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
    [colorSettingsType in ColorSettingsTypes]: React.RefObject<HTMLDivElement>;
  };
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    bottom: number;
  } | null>(null);
  const [externalNumFixedPointsValue, setExternalNumFixedPointsValue] =
    useState(`${settings.numFixedPoints.value}`);

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

  const handleEnvelopeTypeActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.envelopeType.active = !newActivePages.envelopeType.active;

      return newActivePages;
    });
  };

  const handleMuteStyleActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.muteStyle.active = !newActivePages.muteStyle.active;

      return newActivePages;
    });
  };

  const handleAcceptColor = (type: ColorSettingsTypes, color: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings[type].value = color;

      return newSettings;
    });
  };

  const handleChangeFrequency = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExternalNumFixedPointsValue(event.target.value);

    const value = parseInt(event.target.value, 10);

    if (isNaN(value)) return;

    setSettings((prev) => {
      const newSettings = { ...prev };
      newSettings.numFixedPoints.value = Math.max(4, Math.min(100, value));
      return newSettings;
    });
  };

  const handleCloseEnvelopeOptions = (envelopeType: EnvelopeOptionTypes) => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.envelopeType[envelopeType].active =
        !newActivePages.envelopeType[envelopeType].active;

      return newActivePages;
    });
  };

  const handleChangeEnvelopeOption = (
    envelopeOption: EnvelopeOptionTypes,
    key: string,
    value: number
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev };

      // @ts-expect-error key is string
      if (newSettings.envelopeType[envelopeOption][key])
        // @ts-expect-error key is string
        newSettings.envelopeType[envelopeOption][key].value = value;

      return newSettings;
    });
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={settingsPanelRef}
      className='max-h-80 w-64 absolute z-[99999999999999] flex p-2 h-max shadow-md rounded-md bg-fg-tone-black-1 font-K2D text-base text-white pointer-events-auto'
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
            <div className='flex w-full text-nowrap justify-between px-2 rounded items-center'>
              <div className='pr-8'>Frequency</div>
              <FgInput
                className='h-6 rounded-sm'
                onChange={handleChangeFrequency}
                externalValue={externalNumFixedPointsValue}
                options={{ submitButton: false }}
              />
            </div>
            <FgButton
              className='w-full'
              contentFunction={() => (
                <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-between px-2 rounded items-center'>
                  <div>Envelope</div>
                  <div>{envelopeTypesTitles[settings.envelopeType.value]}</div>
                </div>
              )}
              clickFunction={handleEnvelopeTypeActive}
            />
            <FgButton
              className='w-full'
              contentFunction={() => (
                <div className='flex w-full text-nowrap hover:bg-fg-white hover:text-fg-tone-black-1 justify-between px-2 rounded items-center'>
                  <div>Mute style</div>
                  <div>{muteStylesMeta[settings.muteStyle.value].title}</div>
                </div>
              )}
              clickFunction={handleMuteStyleActive}
            />
            {Object.entries(colorSettingsTitles).map(([key, title]) => (
              <div
                key={key}
                className='flex w-full text-nowrap justify-between px-2 rounded items-center'
              >
                <div>{title}</div>
                <ColorPickerButton
                  externalColorPickerPanelRef={
                    colorPickerRefs[key as ColorSettingsTypes]
                  }
                  className='h-6 aspect-square'
                  defaultColor={settings[key as ColorSettingsTypes].value}
                  handleAcceptColorCallback={(color) =>
                    handleAcceptColor(key as ColorSettingsTypes, color)
                  }
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.envelopeType.active &&
          !isDescendantActive(activePages.envelopeType) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              <EnvelopeTypePage
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      <AnimatePresence>
        {activePages.muteStyle.active &&
          !isDescendantActive(activePages.muteStyle) && (
            <motion.div
              className='w-full'
              variants={panelVariants}
              initial='init'
              animate='animate'
              exit='exit'
            >
              <MuteStylePage
                setActivePages={setActivePages}
                settings={settings}
                setSettings={setSettings}
              />
            </motion.div>
          )}
      </AnimatePresence>
      {Object.entries(envelopeTypesTitles).map(
        ([key, title]) =>
          key !== "mixGaussian" && (
            <AnimatePresence key={key}>
              {activePages.envelopeType.active &&
                activePages.envelopeType[`${key}Options` as EnvelopeOptionTypes]
                  .active && (
                  <motion.div
                    className='w-full'
                    variants={panelVariants}
                    initial='init'
                    animate='animate'
                    exit='exit'
                  >
                    <PageTemplate
                      content={
                        <div className='flex w-full h-max flex-col'>
                          {Object.keys(
                            settings.envelopeType[
                              `${key}Options` as EnvelopeOptionTypes
                            ]
                          ).map((envelopeOptionType) => (
                            <FgSlider
                              key={envelopeOptionType}
                              className='h-16 w-[95%]'
                              externalValue={
                                // @ts-expect-error: key is stupid and not recognized as a key
                                settings.envelopeType[
                                  `${key}Options` as EnvelopeOptionTypes
                                ][envelopeOptionType].value
                              }
                              externalStyleValue={
                                // @ts-expect-error: key is stupid and not recognized as a key
                                settings.envelopeType[
                                  `${key}Options` as EnvelopeOptionTypes
                                ][envelopeOptionType].value
                              }
                              onValueChange={(value) => {
                                handleChangeEnvelopeOption(
                                  `${key}Options` as EnvelopeOptionTypes,
                                  envelopeOptionType,
                                  value.value
                                );
                              }}
                              options={{
                                initValue:
                                  // @ts-expect-error: key is stupid and not recognized as a key
                                  settings.envelopeType[
                                    `${key}Options` as EnvelopeOptionTypes
                                  ][envelopeOptionType].value,
                                labelsColor: "#f2f2f2",
                                orientation: "horizontal",
                                tickLabels: false,
                                ...envelopeTypesSliderOptions[
                                  `${key}Options` as EnvelopeOptionTypes
                                ][envelopeOptionType],
                              }}
                            />
                          ))}
                        </div>
                      }
                      pageTitle={title}
                      backFunction={() =>
                        handleCloseEnvelopeOptions(
                          `${key}Options` as EnvelopeOptionTypes
                        )
                      }
                    />
                  </motion.div>
                )}
            </AnimatePresence>
          )
      )}
    </motion.div>,
    document.body
  );
}
