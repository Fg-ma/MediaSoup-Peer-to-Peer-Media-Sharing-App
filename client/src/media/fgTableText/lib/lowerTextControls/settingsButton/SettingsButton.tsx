import React, { useEffect, useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SettingsPanel from "./lib/SettingsPanel";
import { ActivePages } from "../../typeConstant";
import LowerTextController from "../LowerTextController";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import TableTextMediaInstance from "../../../../../media/fgTableText/TableTextMediaInstance";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { SettingsSignals } from "../../../../../context/signalContext/lib/typeConstant";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const settingsIcon = nginxAssetServerBaseUrl + "svgs/settingsIcon.svg";

type RecursiveObject = {
  active?: boolean;
  [key: string]: RecursiveObject | boolean | undefined;
};

export default function SettingsButton({
  textMediaInstance,
  containerRef,
  settingsActive,
  setSettingsActive,
  activePages,
  setActivePages,
  scrollingContainerRef,
  lowerTextController,
  setRerender,
}: {
  textMediaInstance: TableTextMediaInstance;
  containerRef: React.RefObject<HTMLDivElement>;
  settingsActive: boolean;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  lowerTextController: React.MutableRefObject<LowerTextController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    sendSettingsSignal,
    addSettingsSignalListener,
    removeSettingsSignalListener,
  } = useSignalContext();
  const { activeSidePanel, currentSettingsActive } = useGeneralContext();

  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerPanelRef = useRef<HTMLDivElement>(null);
  const textColorPickerPanelRef = useRef<HTMLDivElement>(null);
  const indexColorPickerPanelRef = useRef<HTMLDivElement>(null);

  const deactivateAll = (obj: RecursiveObject) => {
    // Check if the current object has an 'active' property and if it's true
    if (obj.active === true) {
      obj.active = false;
    }

    // Iterate over all keys in the object
    for (const key in obj) {
      // Check if the value is an object, and if so, recurse into it
      if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = deactivateAll(obj[key]);
      }
    }

    // Return false if no 'active' property is true in the current object or its descendants
    return obj;
  };

  const toggleSettings = () => {
    setSettingsActive((prev) => !prev);

    setActivePages((prev) => {
      const newActivePages = { ...prev };

      const deactivePages = deactivateAll(newActivePages);

      return deactivePages as unknown as ActivePages;
    });

    if (!containerRef.current?.classList.contains("in-settings")) {
      containerRef.current?.classList.add("in-settings");
    } else {
      containerRef.current?.classList.remove("in-settings");
    }
  };

  const handleCloseSettings = (event: PointerEvent) => {
    const target = event.target as Node;

    if (
      !settingsButtonRef.current?.contains(target) &&
      !settingsPanelRef.current?.contains(target) &&
      !backgroundColorPickerPanelRef.current?.contains(target) &&
      !textColorPickerPanelRef.current?.contains(target) &&
      !indexColorPickerPanelRef.current?.contains(target)
    ) {
      toggleSettings();
    }
  };

  useEffect(() => {
    if (settingsActive) {
      document.addEventListener("pointerdown", handleCloseSettings);
    }

    return () => {
      if (settingsActive) {
        document.removeEventListener("pointerdown", handleCloseSettings);
      }
    };
  }, [settingsActive]);

  const handleSettingsSignals = (signal: SettingsSignals) => {
    switch (signal.type) {
      case "sidePanelChanged":
        setRerender((prev) => !prev);
        break;
      case "sidePanelClosed":
        setRerender((prev) => !prev);
        break;
      case "sidePanelOpened":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    addSettingsSignalListener(handleSettingsSignals);

    return () => {
      removeSettingsSignalListener(handleSettingsSignals);
    };
  }, []);

  return (
    <>
      <FgButton
        externalRef={settingsButtonRef}
        className="pointer-events-auto flex aspect-square h-full items-center justify-center"
        clickFunction={(event) => {
          if (event.ctrlKey || activeSidePanel.current === "settings") {
            sendSettingsSignal({
              type: "toggleSettingsPanel",
              header: {
                contentType: "text",
                instanceId: textMediaInstance.textInstanceId,
              },
            });
          }

          toggleSettings();
        }}
        contentFunction={() => (
          <FgSVGElement
            src={settingsIcon}
            className={`${
              settingsActive ||
              (activeSidePanel.current === "settings" &&
                currentSettingsActive.current.some(
                  (active) =>
                    active.contentType === "text" &&
                    active.instanceId === textMediaInstance.textInstanceId,
                ))
                ? "-rotate-[30deg]"
                : "rotate-0"
            } h-[90%] w-[90%] fill-fg-white stroke-fg-white transition-transform`}
            attributes={[
              { key: "height", value: "100%" },
              { key: "width", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          !settingsActive ? (
            <FgHoverContentStandard content="Settings (U)" style="light" />
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
      />
      {activeSidePanel.current !== "settings" && settingsActive && (
        <SettingsPanel
          textMediaInstance={textMediaInstance}
          settingsPanelRef={settingsPanelRef}
          settingsButtonRef={settingsButtonRef}
          activePages={activePages}
          setActivePages={setActivePages}
          externalColorPickerPanelRefs={{
            backgroundColor: backgroundColorPickerPanelRef,
            textColor: textColorPickerPanelRef,
            indexColor: indexColorPickerPanelRef,
          }}
          lowerTextController={lowerTextController}
          setRerender={setRerender}
        />
      )}
    </>
  );
}
