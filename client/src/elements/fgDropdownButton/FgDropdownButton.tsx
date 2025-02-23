import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgPortal from "../fgPortal/FgPortal";
import { animate } from "framer-motion";

export default function FgDropdownButton({
  label,
  elements,
  className,
  kind,
}: {
  label?: React.ReactElement | string;
  elements?: React.ReactElement[];
  className?: string;
  kind: "popup" | "inline";
}) {
  const [active, setActive] = useState(false);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    setActive((prev) => !prev);
  };

  return (
    <FgButton
      externalRef={dropdownBtnRef}
      className={`${className} ${
        active ? "border-fg-red" : "border-fg-white"
      } ${
        kind === "inline" || !active ? "border-2" : ""
      } rounded-md bg-fg-tone-black-2 text-fg-white hover:border-fg-red flex flex-col items-center justify-center relative`}
      clickFunction={handleClick}
      contentFunction={() => {
        return (
          <>
            {kind === "inline" && active ? (
              <>
                {label}
                <div className='min-h-1 h-1 w-[90%] rounded-[2px] border-fg-red-light'></div>
                {elements}
              </>
            ) : (
              label
            )}
            {kind === "popup" && active && (
              <FgPortal
                className='flex w-full h-40 max-h-40 overflow-y-auto tiny-vertical-scroll-bar bg-fg-tone-black-2 border-fg-red border-2 flex-col items-center justify-start rounded-md py-1 space-y-0.5'
                type='below'
                externalRef={dropdownBtnRef}
                content={
                  <>
                    {label}
                    <div className='min-h-0.5 h-0.5 w-[90%] rounded-[2px] bg-fg-red-light'></div>
                    {elements}
                  </>
                }
                zValue={100}
                insertionPoint={dropdownBtnRef}
                options={{ animate: false }}
              />
            )}
          </>
        );
      }}
    />
  );
}
