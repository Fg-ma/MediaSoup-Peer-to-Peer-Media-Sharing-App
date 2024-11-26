import React, { useRef, useState } from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";

import chooseBackgroundIcon from "../../public/svgs/chooseBackgroundIcon.svg";
import chooseBackgroundOffIcon from "../../public/svgs/chooseBackgroundOffIcon.svg";
import BackgroundSelectorPanel from "./lib/BackgroundSelectorPanel";

export default function FgBackgroundSelector({
  backgroundRef,
}: {
  backgroundRef: React.RefObject<HTMLDivElement>;
}) {
  const [backgroundSelectorPanelActive, setBackgroundSelectorPanelActive] =
    useState(false);

  const backgroundSelectorBtnRef = useRef<HTMLButtonElement>(null);

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
          backgroundRef={backgroundRef}
          setBackgroundSelectorPanelActive={setBackgroundSelectorPanelActive}
          backgroundSelectorBtnRef={backgroundSelectorBtnRef}
        />
      )}
    </>
  );
}
