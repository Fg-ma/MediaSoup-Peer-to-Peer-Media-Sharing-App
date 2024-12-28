import React, { useEffect, useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import { FgBackground, categories } from "./lib/typeConstant";
import BackgroundSelectorPanel from "./lib/BackgroundSelectorPanel";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const chooseBackgroundIcon =
  nginxAssetSeverBaseUrl + "svgs/chooseBackgroundIcon.svg";
const chooseBackgroundOffIcon =
  nginxAssetSeverBaseUrl + "svgs/chooseBackgroundOffIcon.svg";

export default function FgBackgroundSelector({
  backgroundRef,
  defaultActiveBackground,
  backgroundChangeFunction,
}: {
  backgroundRef: React.RefObject<HTMLDivElement>;
  defaultActiveBackground?: FgBackground;
  backgroundChangeFunction?: (background: FgBackground) => void;
}) {
  const [activeBackground, setActiveBackground] = useState<
    { category: ""; categorySelection: string } | FgBackground
  >(defaultActiveBackground ?? { category: "", categorySelection: "" });
  const [imports, setImports] = useState<{
    [importFilename: string]: { file: File; url: string };
  }>({});
  const [backgroundSelectorPanelActive, setBackgroundSelectorPanelActive] =
    useState(false);

  const backgroundSelectorBtnRef = useRef<HTMLButtonElement>(null);

  const changeBackground = () => {
    if (!backgroundRef.current || activeBackground.categorySelection === "") {
      return;
    }

    if (activeBackground.category !== "") {
      backgroundRef.current.style.backgroundImage =
        categories[activeBackground.category] &&
        // @ts-expect-error: correlation error
        categories[activeBackground.category][
          activeBackground.categorySelection
        ]
          ? // prettier-ignore
            // @ts-expect-error: correlation error
            `url(${categories[activeBackground.category][activeBackground.categorySelection].url})`
          : "";
    } else {
      // prettier-ignore
      backgroundRef.current.style.backgroundImage = `url(${imports[activeBackground.categorySelection].url})`;
    }
    backgroundRef.current.style.backgroundSize = "cover";
    backgroundRef.current.style.backgroundPosition = "center";
    backgroundRef.current.style.backgroundRepeat = "no-repeat";
  };

  useEffect(() => {
    changeBackground();

    if (backgroundChangeFunction) {
      backgroundChangeFunction(activeBackground as FgBackground);
    }
  }, [activeBackground]);

  useEffect(() => {
    if (defaultActiveBackground) setActiveBackground(defaultActiveBackground);
  }, [defaultActiveBackground]);

  return (
    <>
      <FgButton
        externalRef={backgroundSelectorBtnRef}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                backgroundSelectorPanelActive
                  ? chooseBackgroundOffIcon
                  : chooseBackgroundIcon
              }
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "black" },
                { key: "stroke", value: "black" },
              ]}
            />
          );
        }}
        clickFunction={() => setBackgroundSelectorPanelActive((prev) => !prev)}
        hoverContent={
          backgroundSelectorPanelActive ? (
            <FgHoverContentStandard content='Background selector' />
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center h-8 min-h-8 aspect-square relative'
        options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
      />
      {backgroundSelectorPanelActive && (
        <BackgroundSelectorPanel
          setBackgroundSelectorPanelActive={setBackgroundSelectorPanelActive}
          backgroundSelectorBtnRef={backgroundSelectorBtnRef}
          activeBackground={activeBackground}
          setActiveBackground={setActiveBackground}
          imports={imports}
          setImports={setImports}
        />
      )}
    </>
  );
}
