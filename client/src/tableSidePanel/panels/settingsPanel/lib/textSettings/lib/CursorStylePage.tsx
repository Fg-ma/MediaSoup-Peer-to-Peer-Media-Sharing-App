import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import {
  CursorStyles,
  cursorStylesOptionsMeta,
} from "../../../../../../media/fgTableText/lib/typeConstant";

export default function CursorStylePage({
  textMediaInstance,
  setRerender,
}: {
  textMediaInstance: React.MutableRefObject<TableTextMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleSelectCursorStyle = (cursorStyle: CursorStyles) => {
    textMediaInstance.current.settings.cursorStyle.value = cursorStyle;

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div className="h-0.5 w-[95%] rounded-full bg-fg-red-light"></div>
      {Object.entries(cursorStylesOptionsMeta).map(([key, title]) => (
        <FgButton
          key={key}
          className={`${
            textMediaInstance.current.settings.cursorStyle.value === key
              ? "bg-fg-white text-fg-tone-black-1"
              : ""
          } mx-2 flex items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
          style={{ width: "calc(100% - 1rem)" }}
          contentFunction={() => <div className="truncate">{title}</div>}
          clickFunction={() => handleSelectCursorStyle(key as CursorStyles)}
        />
      ))}
    </>
  );
}
