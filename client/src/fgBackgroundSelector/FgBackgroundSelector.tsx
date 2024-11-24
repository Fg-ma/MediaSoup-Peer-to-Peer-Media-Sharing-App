import React, { useRef, useState } from "react";
import FgButton from "../fgElements/fgButton/FgButton";
import FgSVG from "../fgElements/fgSVG/FgSVG";

import chooseBackgroundIcon from "../../public/svgs/chooseBackgroundIcon.svg";
import chooseBackgroundOffIcon from "../../public/svgs/chooseBackgroundOffIcon.svg";
import BackgroundSelectorPanel from "./lib/BackgroundSelectorPanel";

export default function FgBackgroundSelector() {
  const [active, setActive] = useState(false);

  const backgroundSelectorBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <FgButton
        externalRef={backgroundSelectorBtnRef}
        className='w-10 h-10'
        contentFunction={() => {
          return (
            <FgSVG
              src={active ? chooseBackgroundOffIcon : chooseBackgroundIcon}
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
                { key: "fill", value: "white" },
                { key: "stroke", value: "white" },
              ]}
            />
          );
        }}
        clickFunction={() => setActive((prev) => !prev)}
      />
      {active && (
        <BackgroundSelectorPanel
          setActive={setActive}
          backgroundSelectorBtnRef={backgroundSelectorBtnRef}
        />
      )}
    </div>
  );
}
