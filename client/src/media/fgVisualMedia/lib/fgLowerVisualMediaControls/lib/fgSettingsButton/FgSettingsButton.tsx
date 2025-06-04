import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SettingsPanel from "./lib/SettingsPanel";
import { ActivePages } from "../../FgLowerVisualMediaControls";
import { FgVisualMediaOptions } from "../../../typeConstant";
import RemoteVisualMedia from "../../../../../../media/fgVisualMedia/RemoteVisualMedia";
import ScreenMedia from "../../../../../../media/fgVisualMedia/ScreenMedia";
import CameraMedia from "../../../../../../media/fgVisualMedia/CameraMedia";
import { useSignalContext } from "../../../../../../context/signalContext/SignalContext";
import { SettingsSignals } from "../../../../../../context/signalContext/lib/typeConstant";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";
import { useGeneralContext } from "../../../../../../context/generalContext/GeneralContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const settingsIcon = nginxAssetServerBaseUrl + "svgs/settingsIcon.svg";

type RecursiveObject = {
  active?: boolean;
  [key: string]: RecursiveObject | boolean | undefined;
};

export default function FgSettingsButton({
  username,
  instance,
  visualMedia,
  type,
  visualMediaId,
  fgVisualMediaOptions,
  visualEffectsActive,
  visualMediaContainerRef,
  settingsActive,
  setSettingsActive,
  activePages,
  setActivePages,
  scrollingContainerRef,
  fgLowerVisualMediaController,
  setRerender,
}: {
  username: string;
  instance: string;
  visualMedia: CameraMedia | ScreenMedia | RemoteVisualMedia;
  type: "camera" | "screen";
  visualMediaId: string;
  fgVisualMediaOptions: FgVisualMediaOptions;
  visualEffectsActive: boolean;
  visualMediaContainerRef: React.RefObject<HTMLDivElement>;
  settingsActive: boolean;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
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

    if (!visualMediaContainerRef.current?.classList.contains("in-settings")) {
      visualMediaContainerRef.current?.classList.add("in-settings");
    } else {
      visualMediaContainerRef.current?.classList.remove("in-settings");
    }
  };

  useEffect(() => {
    const handleCloseSettings = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !settingsButtonRef.current?.contains(target) &&
        !settingsPanelRef.current?.contains(target)
      ) {
        toggleSettings();
      }
    };

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
                contentType: type,
                instanceId: visualMediaId,
                visualMediaInfo: {
                  isUser:
                    fgVisualMediaOptions.isUser === undefined
                      ? false
                      : fgVisualMediaOptions.isUser,
                  username,
                  instance,
                },
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
                    active.contentType === type &&
                    active.instanceId === visualMediaId,
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
          !visualEffectsActive && !settingsActive ? (
            <FgHoverContentStandard content="Settings" style="light" />
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
      />
      {activeSidePanel.current !== "settings" && settingsActive && (
        <SettingsPanel
          visualMedia={visualMedia}
          fgVisualMediaOptions={fgVisualMediaOptions}
          settingsPanelRef={settingsPanelRef}
          settingsButtonRef={settingsButtonRef}
          activePages={activePages}
          setActivePages={setActivePages}
          setSettingsActive={setSettingsActive}
          fgLowerVisualMediaController={fgLowerVisualMediaController}
          setRerender={setRerender}
        />
      )}
    </>
  );
}
