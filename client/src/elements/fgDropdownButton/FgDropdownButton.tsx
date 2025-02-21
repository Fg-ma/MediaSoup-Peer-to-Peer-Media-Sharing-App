import React, { useState } from "react";
import FgButton from "../fgButton/FgButton";

export default function FgDropdownButton({
  label,
  elements,
  className,
}: {
  label?: React.ReactElement;
  elements?: React.ReactElement[];
  className?: string;
}) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive((prev) => !prev);
  };

  return (
    <FgButton
      className={`${className} ${
        active ? "border-fg-red" : "border-fg-white"
      } bg-fg-tone-black-2 text-fg-white hover:border-fg-red flex flex-col items-center justify-center overflow-hidden`}
      clickFunction={handleClick}
      contentFunction={() => {
        return active ? (
          <>
            {label}
            <div className='min-h-1 h-1 w-[90%] rounded-[2px] border-fg-red-light'></div>
            {elements}
          </>
        ) : (
          label
        );
      }}
    />
  );
}
