import React, { useEffect, useRef, useState } from "react";
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

  const handleClick = (event: MouseEvent) => {
    if (active) {
      setActive(false);
    } else {
      if (dropdownBtnRef.current?.contains(event.target as Node)) {
        setActive(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  return (
    <FgButton
      externalRef={dropdownBtnRef}
      className={`${className} ${
        active ? "border-fg-red" : "border-fg-white"
      } ${
        kind === "inline" || !active ? "border-2" : ""
      } relative flex flex-col items-center justify-center rounded-md bg-fg-tone-black-2 text-fg-white hover:border-fg-red`}
      contentFunction={() => {
        return (
          <>
            {kind === "inline" && active ? (
              <>
                {label}
                <div className="h-1 min-h-1 w-[90%] rounded-[2px] border-fg-red-light"></div>
                {elements}
              </>
            ) : (
              label
            )}
            {kind === "popup" && active && (
              <FgPortal
                className="tiny-vertical-scroll-bar flex h-min max-h-40 w-full flex-col items-center justify-start space-y-0.5 overflow-y-auto rounded-md border-2 border-fg-red bg-fg-tone-black-2 py-1"
                type="below"
                externalRef={dropdownBtnRef}
                content={
                  <>
                    {label}
                    <div className="h-0.5 min-h-0.5 w-[90%] rounded-[2px] bg-fg-red-light"></div>
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
