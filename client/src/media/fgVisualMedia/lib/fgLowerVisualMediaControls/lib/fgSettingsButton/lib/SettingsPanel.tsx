import React, { useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import FgButton from "../../../../../../../elements/fgButton/FgButton";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./ClosedCaptionsPage";
import ClosedCaptionsOptionsPage, {
  closedCaptionsOptionsArrays,
} from "./ClosedCaptionsOptionsPage";
import PageTemplate from "./PageTemplate";
import { ActivePages } from "../../../FgLowerVisualMediaControls";
import { FgVisualMediaOptions } from "../../../../typeConstant";
import FgPortal from "../../../../../../../elements/fgPortal/FgPortal";
import RemoteVisualMedia from "../../../../../../../media/fgVisualMedia/RemoteVisualMedia";
import ScreenMedia from "../../../../../../../media/fgVisualMedia/ScreenMedia";
import CameraMedia from "../../../../../../../media/fgVisualMedia/CameraMedia";
import FgHoverContentStandard from "../../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../../../../../elements/fgSVGElement/FgSVGElement";
import FgLowerVisualMediaController from "../../FgLowerVisualMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const captionsIcon = nginxAssetServerBaseUrl + "svgs/captionsIcon.svg";

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

type ClosedCaptionOptions =
  | "fontFamily"
  | "fontColor"
  | "fontOpacity"
  | "fontSize"
  | "backgroundColor"
  | "backgroundOpacity"
  | "characterEdgeStyle";

const closedCaptionOptions = [
  "fontFamily",
  "fontColor",
  "fontOpacity",
  "fontSize",
  "backgroundColor",
  "backgroundOpacity",
  "characterEdgeStyle",
];

const closedCaptionOptionsPageTitles = {
  fontFamily: "Font family",
  fontColor: "Font color",
  fontOpacity: "Font opacity",
  fontSize: "Font size",
  backgroundColor: "Background color",
  backgroundOpacity: "Background opacity",
  characterEdgeStyle: "Character edge style",
};

export default function SettingsPanel({
  visualMedia,
  fgVisualMediaOptions,
  fgLowerVisualMediaController,
  settingsPanelRef,
  settingsButtonRef,
  activePages,
  setActivePages,
  setSettingsActive,
  setRerender,
}: {
  visualMedia: CameraMedia | ScreenMedia | RemoteVisualMedia;
  fgVisualMediaOptions: FgVisualMediaOptions;
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  settingsButtonRef: React.RefObject<HTMLButtonElement>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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

  const handleClosedCaptionsActive = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.closedCaption.active =
        !newActivePages.closedCaption.active;

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
      className="flex pointer-events-auto absolute z-settings-panel h-max max-h-80 w-64 rounded-md border-2 border-fg-white bg-fg-tone-black-1 p-2 font-K2D text-base text-fg-white shadow-md shadow-fg-tone-black-8"
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
                        visualMedia.settings.background.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={backgroundIcon}
                        className="flex mr-2 aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      <div className="truncate">Set as background</div>
                    </div>
                  )}
                  clickFunction={() => {
                    visualMedia.settings.background.value =
                      !visualMedia.settings.background.value;

                    setSettingsActive(false);
                    setRerender((prev) => !prev);
                  }}
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
                    <div
                      className={`${
                        visualMedia.settings.pictureInPicture.value
                          ? "bg-fg-white text-fg-tone-black-1"
                          : ""
                      } group/pictureInPicture flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                    >
                      <div className="mr-2 flex aspect-square h-[90%] items-center justify-center">
                        <div
                          className={`flex h-[65%] w-[80%] rounded-md border-3 group-hover/pictureInPicture:border-fg-tone-black-1 ${
                            visualMedia.settings.pictureInPicture.value
                              ? "items-start justify-start border-fg-tone-black-1"
                              : "items-end justify-end border-fg-white"
                          }`}
                        >
                          <div
                            className={`h-[50%] w-[60%] rounded-sm group-hover/pictureInPicture:bg-fg-tone-black-1 ${
                              visualMedia.settings.pictureInPicture.value
                                ? "ml-[10%] mt-[10%] bg-fg-tone-black-1"
                                : "mb-[10%] mr-[10%] bg-fg-white"
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="truncate">
                        {visualMedia.settings.pictureInPicture.value
                          ? "Close picture in picture"
                          : "Open picture in picture"}
                      </div>
                    </div>
                  )}
                  clickFunction={() => {
                    fgLowerVisualMediaController.current.handleMiniPlayer();

                    setRerender((prev) => !prev);
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content="Picture in picture (i)"
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
                        visualMedia.settings.captions.value
                          ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                          : "fill-fg-white stroke-fg-white"
                      } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
                    >
                      <FgSVGElement
                        src={captionsIcon}
                        className="flex mr-2 aspect-square h-full items-center justify-center"
                        attributes={[
                          { key: "width", value: "80%" },
                          { key: "height", value: "80%" },
                        ]}
                      />
                      <div className="truncate">
                        {visualMedia.settings.captions.value
                          ? "Disable captions"
                          : "Enable captions"}
                      </div>
                    </div>
                  )}
                  clickFunction={() => {
                    fgLowerVisualMediaController.current.handleClosedCaptions();

                    fgLowerVisualMediaController.current.updateCaptionsStyles();

                    setTimeout(() => {
                      setRerender((prev) => !prev);
                    }, 0);
                  }}
                  hoverContent={
                    <FgHoverContentStandard
                      content="Captions (c)"
                      style="light"
                    />
                  }
                  options={{
                    hoverSpacing: 4,
                    hoverTimeoutDuration: 3500,
                    hoverType: "above",
                  }}
                />
                {fgVisualMediaOptions.isVolume && (
                  <FgButton
                    className="w-full"
                    contentFunction={() => (
                      <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
                        <div>Subtitles</div>
                        <div>
                          {
                            closedCaptionsSelections[
                              visualMedia.settings.closedCaption.value
                            ]
                          }
                        </div>
                      </div>
                    )}
                    clickFunction={handleClosedCaptionsActive}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              !isDescendantActive(activePages.closedCaption) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <ClosedCaptionsPage
                    visualMedia={visualMedia}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              activePages.closedCaption.closedCaptionOptionsActive.active &&
              !isDescendantActive(
                activePages.closedCaption.closedCaptionOptionsActive,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  <ClosedCaptionsOptionsPage
                    visualMedia={visualMedia}
                    setActivePages={setActivePages}
                  />
                </motion.div>
              )}
          </AnimatePresence>
          <AnimatePresence>
            {activePages.closedCaption.active &&
              activePages.closedCaption.closedCaptionOptionsActive.active &&
              isDescendantActive(
                activePages.closedCaption.closedCaptionOptionsActive,
              ) && (
                <motion.div
                  className="w-full"
                  variants={panelVariants}
                  initial="init"
                  animate="animate"
                  exit="exit"
                >
                  {closedCaptionOptions.map((option) => {
                    const activePage =
                      activePages.closedCaption.closedCaptionOptionsActive[
                        option as ClosedCaptionOptions
                      ];
                    const activeSetting =
                      visualMedia.settings.closedCaption.closedCaptionOptions[
                        option as ClosedCaptionOptions
                      ];

                    return (
                      activePage.active && (
                        <PageTemplate
                          key={option}
                          content={closedCaptionsOptionsArrays[
                            option as ClosedCaptionOptions
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
                                visualMedia.settings.closedCaption.closedCaptionOptions[
                                  option as ClosedCaptionOptions
                                ].value = type;

                                setRerender((prev) => !prev);
                              }}
                            />
                          ))}
                          pageTitle={
                            closedCaptionOptionsPageTitles[
                              option as ClosedCaptionOptions
                            ]
                          }
                          backFunction={() => {
                            setActivePages((prev) => {
                              const newActivePages = { ...prev };

                              newActivePages.closedCaption.closedCaptionOptionsActive[
                                option as ClosedCaptionOptions
                              ].active =
                                !newActivePages.closedCaption
                                  .closedCaptionOptionsActive[
                                  option as ClosedCaptionOptions
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
