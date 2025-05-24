import React, { useEffect, useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SettingsPanel from "./lib/SettingsPanel";
import { Settings, ActivePages } from "../../typeConstant";
import LowerTextController from "../LowerTextController";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const settingsIcon = nginxAssetServerBaseUrl + "svgs/settingsIcon.svg";

type RecursiveObject = {
  active?: boolean;
  [key: string]: RecursiveObject | boolean | undefined;
};

export default function SettingsButton({
  containerRef,
  settingsActive,
  setSettingsActive,
  activePages,
  setActivePages,
  settings,
  setSettings,
  scrollingContainerRef,
  lowerTextController,
  isReadOnly,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  settingsActive: boolean;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  lowerTextController: React.MutableRefObject<LowerTextController>;
  isReadOnly: boolean;
}) {
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

  return (
    <>
      <FgButton
        externalRef={settingsButtonRef}
        className="pointer-events-auto flex aspect-square h-full items-center justify-center"
        clickFunction={toggleSettings}
        contentFunction={() => (
          <FgSVGElement
            src={settingsIcon}
            className={`${settingsActive ? "-rotate-[30deg]" : "rotate-0"} h-[90%] w-[90%] fill-fg-white stroke-fg-white transition-transform`}
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
      {settingsActive && (
        <SettingsPanel
          settingsPanelRef={settingsPanelRef}
          settingsButtonRef={settingsButtonRef}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          externalColorPickerPanelRefs={{
            backgroundColor: backgroundColorPickerPanelRef,
            textColor: textColorPickerPanelRef,
            indexColor: indexColorPickerPanelRef,
          }}
          lowerTextController={lowerTextController}
          isReadOnly={isReadOnly}
        />
      )}
    </>
  );
}
