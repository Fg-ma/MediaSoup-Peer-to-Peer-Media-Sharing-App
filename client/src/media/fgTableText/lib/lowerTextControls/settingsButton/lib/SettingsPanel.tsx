import React, { useEffect, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../context/effectsContext/EffectsContext";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { ActivePages } from "../../../typeConstant";
import ColorsPage from "./ColorsPage";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FontStylePage from "./FontStylePage";
import LowerTextController from "../../LowerTextController";
import CursorStylePage from "./CursorStylePage";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import FgPortal from "../../../../../../elements/fgPortal/FgPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetServerBaseUrl + "svgs/additionIcon.svg";
const minusIcon = nginxAssetServerBaseUrl + "svgs/minusIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const mapIcon = nginxAssetServerBaseUrl + "svgs/mapIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

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
  textMediaInstance,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  externalColorPickerPanelRefs,
  lowerTextController,
  setRerender,
}: {
  textMediaInstance: TableTextMediaInstance;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  externalColorPickerPanelRefs: {
    backgroundColor: React.RefObject<HTMLDivElement>;
    textColor: React.RefObject<HTMLDivElement>;
    indexColor: React.RefObject<HTMLDivElement>;
  };
  lowerTextController: React.MutableRefObject<LowerTextController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const effectsStyles =
    staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId];

  const holdTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const holdInterval = useRef<NodeJS.Timeout | undefined>(undefined);

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
    const effectStyles =
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId];
    const currentValue = parseInt(effectStyles.fontSize.slice(0, -2));

    if (type === "increment") {
      effectStyles.fontSize = `${currentValue + value}px`;
    } else if (type === "decrement") {
      effectStyles.fontSize = `${Math.max(1, currentValue - value)}px`;
    } else {
      effectStyles.fontSize = `${Math.max(1, value)}px`;
    }

    if (textMediaInstance.settings.synced.value) {
      tableStaticContentSocket.current?.updateContentEffects(
        "text",
        textMediaInstance.textMedia.textId,
        textMediaInstance.textInstanceId,
        undefined,
        staticContentEffectsStyles.current.text[
          textMediaInstance.textInstanceId
        ],
      );
    }

    setRerender((prev) => !prev);
  };

  const handleLetterSpacingChange = (
    type: "increment" | "decrement" | "value",
    value: number,
  ) => {
    const effectStyles =
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId];
    const currentValue = effectStyles.letterSpacing;

    if (type === "increment") {
      effectStyles.letterSpacing = Math.min(20, currentValue + value);
    } else if (type === "decrement") {
      effectStyles.letterSpacing = Math.max(-5, currentValue - value);
    } else {
      effectStyles.letterSpacing = Math.min(20, Math.max(-5, value));
    }

    if (textMediaInstance.settings.synced.value) {
      tableStaticContentSocket.current?.updateContentEffects(
        "text",
        textMediaInstance.textMedia.textId,
        textMediaInstance.textInstanceId,
        undefined,
        staticContentEffectsStyles.current.text[
          textMediaInstance.textInstanceId
        ],
      );
    }

    setRerender((prev) => !prev);
  };

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [activePages]);

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
                        textMediaInstance.settings.synced.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={
                          textMediaInstance.settings.synced.value
                            ? desyncIcon
                            : syncIcon
                        }
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      {textMediaInstance.settings.synced.value
                        ? "Desync"
                        : "Sync"}
                    </div>
                  )}
                  clickFunction={lowerTextController.current.handleSync}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        textMediaInstance.settings.synced.value
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
                        textMediaInstance.settings.background.value
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
                  clickFunction={
                    lowerTextController.current.handleSetAsBackground
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
                      {textMediaInstance.isReadOnly ? "Edit" : "Stop editing"}
                    </div>
                  )}
                  clickFunction={lowerTextController.current.handleEdit}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        textMediaInstance.isReadOnly
                          ? "Edit (e)"
                          : "Stop editing (e)"
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
                    <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <FgSVGElement
                        src={mapIcon}
                        className="mr-2 flex aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      {textMediaInstance.settings.minimap.value
                        ? "Close minimap"
                        : "Open minimap"}
                    </div>
                  )}
                  clickFunction={lowerTextController.current.handleMinimap}
                  hoverContent={
                    <FgHoverContentStandard
                      content={
                        textMediaInstance.settings.minimap.value
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
                    <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div>Colors</div>
                      <FgSVGElement
                        src={navigateForwardIcon}
                        attributes={[
                          { key: "width", value: "1.25rem" },
                          { key: "height", value: "1.25rem" },
                        ]}
                      />
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
                      pointerDownFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }

                        holdTimeout.current = setTimeout(() => {
                          holdInterval.current = setInterval(() => {
                            handleFontSizeChange("increment", 1);
                          }, 50);
                        }, 1000);
                      }}
                      pointerUpFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }
                      }}
                      hoverContent={
                        <FgHoverContentStandard
                          content="Increase"
                          style="light"
                        />
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
                      value={effectsStyles.fontSize.slice(0, -2)}
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
                      pointerDownFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }

                        holdTimeout.current = setTimeout(() => {
                          holdInterval.current = setInterval(() => {
                            handleFontSizeChange("decrement", 1);
                          }, 50);
                        }, 1000);
                      }}
                      pointerUpFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }
                      }}
                      hoverContent={
                        <FgHoverContentStandard
                          content="Decrease"
                          style="light"
                        />
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
                    <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div>Font style</div>
                      <FgSVGElement
                        src={navigateForwardIcon}
                        attributes={[
                          { key: "width", value: "1.25rem" },
                          { key: "height", value: "1.25rem" },
                        ]}
                      />
                    </div>
                  )}
                  clickFunction={handleFontStyleActive}
                />
                <div className="flex h-7 w-full items-center justify-between">
                  <div className="flex w-max items-center justify-start text-nowrap rounded px-2 text-lg">
                    Letter gap
                  </div>
                  <div className="flex h-full w-max items-center justify-center space-x-1">
                    <FgButton
                      className="h-full"
                      clickFunction={() =>
                        handleLetterSpacingChange("increment", 1)
                      }
                      pointerDownFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }

                        holdTimeout.current = setTimeout(() => {
                          holdInterval.current = setInterval(() => {
                            handleLetterSpacingChange("increment", 1);
                          }, 50);
                        }, 1000);
                      }}
                      pointerUpFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }
                      }}
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
                        <FgHoverContentStandard
                          content="Increase"
                          style="light"
                        />
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
                      value={effectsStyles.letterSpacing}
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        const parsedValue =
                          inputValue.trim() !== "" && !isNaN(Number(inputValue))
                            ? parseInt(inputValue, 10)
                            : 0;

                        handleLetterSpacingChange("value", parsedValue);
                      }}
                      placeholder="Space..."
                    />
                    <FgButton
                      className="h-full"
                      clickFunction={() =>
                        handleLetterSpacingChange("decrement", 1)
                      }
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
                      pointerDownFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }

                        holdTimeout.current = setTimeout(() => {
                          holdInterval.current = setInterval(() => {
                            handleLetterSpacingChange("decrement", 1);
                          }, 50);
                        }, 1000);
                      }}
                      pointerUpFunction={() => {
                        if (holdTimeout.current) {
                          clearTimeout(holdTimeout.current);
                          holdTimeout.current = undefined;
                        }
                        if (holdInterval.current) {
                          clearInterval(holdInterval.current);
                          holdInterval.current = undefined;
                        }
                      }}
                      hoverContent={
                        <FgHoverContentStandard
                          content="Decrease"
                          style="light"
                        />
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
                    <div className="flex w-full items-center justify-between space-x-4 text-nowrap rounded fill-fg-white stroke-fg-white px-2 hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
                      <div>Cursor</div>
                      <FgSVGElement
                        src={navigateForwardIcon}
                        attributes={[
                          { key: "width", value: "1.25rem" },
                          { key: "height", value: "1.25rem" },
                        ]}
                      />
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
                    textMediaInstance={textMediaInstance}
                    setActivePages={setActivePages}
                    externalColorPickerPanelRefs={externalColorPickerPanelRefs}
                    setRerender={setRerender}
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
                    textMediaInstance={textMediaInstance}
                    setActivePages={setActivePages}
                    setRerender={setRerender}
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
                    textMediaInstance={textMediaInstance}
                    setRerender={setRerender}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
        </>
      }
    />
  );
}
