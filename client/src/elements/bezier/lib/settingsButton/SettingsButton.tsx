import React, { useEffect, useRef } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SettingsPanel from "./lib/SettingsPanel";
import { ActivePages, Settings } from "../typeConstant";
import BezierController from "../BezierController";

type RecursiveObject = {
  active?: boolean;
  [key: string]: RecursiveObject | boolean | undefined;
};

export default function SettingsButton({
  settingsActive,
  setSettingsActive,
  activePages,
  setActivePages,
  settings,
  setSettings,
}: {
  settingsActive: boolean;
  setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>;
  activePages: ActivePages;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) {
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const shadowColorPickerRef = useRef<HTMLDivElement>(null);
  const overlayColorPickerRef = useRef<HTMLDivElement>(null);
  const neonColorPickerRef = useRef<HTMLDivElement>(null);

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
  };

  const handleCloseSettings = (event: PointerEvent) => {
    const target = event.target as Node;

    if (
      !settingsButtonRef.current?.contains(target) &&
      !settingsPanelRef.current?.contains(target) &&
      !backgroundColorPickerRef.current?.contains(target) &&
      !colorPickerRef.current?.contains(target) &&
      !shadowColorPickerRef.current?.contains(target) &&
      !overlayColorPickerRef.current?.contains(target) &&
      !neonColorPickerRef.current?.contains(target)
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
        className='flex items-center justify-center pointer-events-auto h-[85%] aspect-square z-20'
        clickFunction={(event) => {
          event.stopPropagation();
          toggleSettings();
        }}
        contentFunction={() => (
          <svg
            className='h-full aspect-square'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 100 100'
            style={{
              transform: settingsActive ? "rotate(-30deg)" : "rotate(0deg)",
              transition: "transform 0.2s linear",
            }}
            fill='#f2f2f2'
          >
            <path
              d='m 44.41875,97.5 q -3.20625,0 -5.52187,-2.1375 -2.31563,-2.1375 -2.79063,-5.225 L 35.0375,82.3 Q 33.49375,81.70625 32.12813,80.875 30.7625,80.04375 29.45625,79.09375 l -7.3625,3.0875 Q 19.125,83.4875 16.15625,82.41875 13.1875,81.35 11.525,78.61875 L 5.94375,68.88125 Q 4.28125,66.15 4.99375,63.0625 5.70625,59.975 8.2,57.95625 l 6.29375,-4.75 Q 14.375,52.375 14.375,51.60312 v -3.20624 q 0,-0.77188 0.11875,-1.60313 L 8.2,42.04375 Q 5.70625,40.025 4.99375,36.9375 4.28125,33.85 5.94375,31.11875 l 5.58125,-9.7375 q 1.6625,-2.73125 4.63125,-3.8 2.96875,-1.06875 5.9375,0.2375 l 7.3625,3.0875 q 1.30625,-0.95 2.73125,-1.78125 1.425,-0.83125 2.85,-1.425 L 36.10625,9.8625 Q 36.58125,6.775 38.89688,4.6375 41.2125,2.5 44.41875,2.5 h 11.1625 q 3.20625,0 5.52188,2.1375 2.31562,2.1375 2.79062,5.225 L 64.9625,17.7 q 1.54375,0.59375 2.90938,1.425 1.36562,0.83125 2.67187,1.78125 l 7.3625,-3.0875 q 2.96875,-1.30625 5.9375,-0.2375 2.96875,1.06875 4.63125,3.8 l 5.58125,9.7375 q 1.6625,2.73125 0.95,5.81875 -0.7125,3.0875 -3.20625,5.10625 l -6.29375,4.75 Q 85.625,47.625 85.625,48.39688 v 3.20624 q 0,0.77188 -0.2375,1.60313 l 6.29375,4.75 Q 94.175,59.975 94.8875,63.0625 95.6,66.15 93.9375,68.88125 l -5.7,9.7375 q -1.6625,2.73125 -4.63125,3.8 -2.96875,1.06875 -5.9375,-0.2375 l -7.125,-3.0875 q -1.30625,0.95 -2.73125,1.78125 -1.425,0.83125 -2.85,1.425 l -1.06875,7.8375 q -0.475,3.0875 -2.79062,5.225 Q 58.7875,97.5 55.58125,97.5 Z M 45.25,88 h 9.38125 l 1.6625,-12.5875 q 3.68125,-0.95 6.82813,-2.79062 3.14687,-1.84063 5.75937,-4.45313 l 11.75625,4.86875 4.63125,-8.075 -10.2125,-7.71875 Q 75.65,55.58125 75.8875,53.74063 76.125,51.9 76.125,50 q 0,-1.9 -0.2375,-3.74063 Q 75.65,44.41875 75.05625,42.75625 L 85.26875,35.0375 80.6375,26.9625 68.88125,31.95 Q 66.26875,29.21875 63.12188,27.37813 59.975,25.5375 56.29375,24.5875 L 54.75,12 h -9.38125 l -1.6625,12.5875 q -3.68125,0.95 -6.82812,2.79063 -3.14688,1.84062 -5.75938,4.45312 L 19.3625,26.9625 l -4.63125,8.075 10.2125,7.6 Q 24.35,44.41875 24.1125,46.2 23.875,47.98125 23.875,50 q 0,1.9 0.2375,3.68125 0.2375,1.78125 0.83125,3.5625 l -10.2125,7.71875 4.63125,8.075 11.75625,-4.9875 q 2.6125,2.73125 5.75938,4.57188 3.14687,1.84062 6.82812,2.79062 z m 4.9875,-21.375 q 6.8875,0 11.75625,-4.86875 Q 66.8625,56.8875 66.8625,50 q 0,-6.8875 -4.86875,-11.75625 Q 57.125,33.375 50.2375,33.375 q -7.00625,0 -11.81562,4.86875 Q 33.6125,43.1125 33.6125,50 q 0,6.8875 4.80938,11.75625 Q 43.23125,66.625 50.2375,66.625 Z M 50,50 Z'
              strokeWidth={0.11875}
            />
          </svg>
        )}
        hoverContent={
          !settingsActive ? (
            <FgHoverContentStandard content='Settings' style='light' />
          ) : undefined
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "above",
          hoverZValue: 500000000,
        }}
      />
      {settingsActive && (
        <SettingsPanel
          settingsPanelRef={settingsPanelRef}
          settingsButtonRef={settingsButtonRef}
          activePages={activePages}
          setActivePages={setActivePages}
          settings={settings}
          setSettings={setSettings}
          colorPickerRefs={{
            backgroundColor: backgroundColorPickerRef,
            color: colorPickerRef,
            shadowColor: shadowColorPickerRef,
            overlayColor: overlayColorPickerRef,
            neonColor: neonColorPickerRef,
          }}
        />
      )}
    </>
  );
}
