import React, { useEffect, useRef, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
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
  muteStyleTypes,
  MuteStyleTypes,
} from "../../typeConstant";
import EnvelopeTypePage from "./EnvelopeTypePage";
import MuteStylePage from "./MuteStylePage";
import ColorPickerButton from "../../../../../elements/colorPickerButton/ColorPickerButton";
import FgInput from "../../../../../elements/fgInput/FgInput";
import PageTemplate from "./PageTemplate";
import FgSlider from "../../../../../elements/fgSlider/FgSlider";
import FgPortal from "../../../../../elements/fgPortal/FgPortal";

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
  setSettingsActive,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  settings,
  setSettings,
  colorPickerRefs,
  setIsBezierCurveEditor,
}: {
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  colorPickerRefs: {
    [colorSettingsType in ColorSettingsTypes]: React.RefObject<HTMLDivElement>;
  };
  setIsBezierCurveEditor: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { userStaticContentSocket } = useSocketContext();

  const [externalNumFixedPointsValue, setExternalNumFixedPointsValue] =
    useState(`${settings.numFixedPoints.value}`);
  const [_, setRerender] = useState(false);

  const firstMuteStylesPage = useRef(false);

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
    event: React.ChangeEvent<HTMLInputElement>,
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
    value: number,
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

  useEffect(() => {
    if (!activePages.muteStyle.active || firstMuteStylesPage.current) return;

    firstMuteStylesPage.current = true;

    userStaticContentSocket.current?.requestMuteStyles();
  }, [activePages.muteStyle.active]);

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
                <div className="flex w-full items-center justify-between text-nowrap rounded px-2">
                  <div className="pr-8">Frequency</div>
                  <FgInput
                    className="h-6 rounded-sm"
                    onChange={handleChangeFrequency}
                    externalValue={externalNumFixedPointsValue}
                    options={{ submitButton: false }}
                  />
                </div>
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                      <div>Envelope</div>
                      <div>
                        {envelopeTypesTitles[settings.envelopeType.value]}
                      </div>
                    </div>
                  )}
                  clickFunction={handleEnvelopeTypeActive}
                />
                <FgButton
                  className="w-full"
                  contentFunction={() => (
                    <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                      <div className="mr-3">Mute style</div>
                      <div className="h-full grow truncate text-right">
                        {muteStyleTypes.includes(
                          settings.muteStyle.value as MuteStyleTypes,
                        )
                          ? muteStylesMeta[
                              settings.muteStyle.value as MuteStyleTypes
                            ].title
                          : (() => {
                              const entry = Object.entries(
                                staticContentMedia.current.svg.user,
                              ).find(
                                ([svgId]) => svgId === settings.muteStyle.value,
                              );
                              return entry
                                ? entry[1].filename.slice(
                                    0,
                                    entry[1].filename.lastIndexOf("."),
                                  )
                                : "";
                            })()}
                      </div>
                    </div>
                  )}
                  clickFunction={handleMuteStyleActive}
                />
                {Object.entries(colorSettingsTitles).map(([key, title]) => (
                  <div
                    key={key}
                    className="flex w-full items-center justify-between text-nowrap rounded px-2"
                  >
                    <div>{title}</div>
                    <ColorPickerButton
                      externalColorPickerPanelRef={
                        colorPickerRefs[key as ColorSettingsTypes]
                      }
                      className="aspect-square h-6"
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
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
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
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <MuteStylePage
                    setSettingsActive={setSettingsActive}
                    setActivePages={setActivePages}
                    settings={settings}
                    setSettings={setSettings}
                    setIsBezierCurveEditor={setIsBezierCurveEditor}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          {Object.entries(envelopeTypesTitles).map(
            ([key, title]) =>
              key !== "mixGaussian" && (
                <AnimatePresence key={key}>
                  {activePages.envelopeType.active &&
                    activePages.envelopeType[
                      `${key}Options` as EnvelopeOptionTypes
                    ].active && (
                      <motion.div
                        className="w-full"
                        variants={panelVariants}
                        initial="init"
                        animate="animate"
                        exit="exit"
                      >
                        <PageTemplate
                          content={
                            <div className="flex h-max w-full flex-col">
                              {Object.keys(
                                settings.envelopeType[
                                  `${key}Options` as EnvelopeOptionTypes
                                ],
                              ).map((envelopeOptionType) => (
                                <FgSlider
                                  key={envelopeOptionType}
                                  className="h-16 w-[95%]"
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
                                      value.value,
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
                              `${key}Options` as EnvelopeOptionTypes,
                            )
                          }
                        />
                      </motion.div>
                    )}
                </AnimatePresence>
              ),
          )}
        </>
      }
    />
  );
}
