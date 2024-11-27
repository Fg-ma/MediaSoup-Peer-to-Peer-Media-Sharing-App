import React, { useEffect, useRef, useState } from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";
import { ActiveBackground, categories } from "./lib/typeConstant";
import BackgroundSelectorPanel from "./lib/BackgroundSelectorPanel";

import chooseBackgroundIcon from "../../public/svgs/chooseBackgroundIcon.svg";
import chooseBackgroundOffIcon from "../../public/svgs/chooseBackgroundOffIcon.svg";

export default function FgBackgroundSelector({
  backgroundRef,
  defaultActiveBackground,
}: {
  backgroundRef: React.RefObject<HTMLDivElement>;
  defaultActiveBackground?: ActiveBackground;
}) {
  const [activeBackground, setActiveBackground] = useState<
    { category: ""; categorySelection: string } | ActiveBackground
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
            <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
              Background selector
            </div>
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
