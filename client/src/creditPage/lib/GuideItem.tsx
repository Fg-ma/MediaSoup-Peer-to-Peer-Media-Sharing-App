import React from "react";
import FgButton from "../../elements/fgButton/FgButton";

export default function GuideItem({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <div className="flex w-full items-center justify-start">
      <FgButton
        contentFunction={() => (
          <div className="flex w-max flex-col items-center justify-center font-K2D text-xl text-fg-white hover:text-fg-table-light-blue">
            {title}
            <div className="h-1 w-[115%] rounded-[2px] bg-fg-red-light"></div>
          </div>
        )}
        clickFunction={() => {
          const label = document.getElementById(id);
          if (label) {
            label.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />
    </div>
  );
}
