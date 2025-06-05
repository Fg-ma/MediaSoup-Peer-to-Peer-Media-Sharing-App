import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../context/effectsContext/EffectsContext";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import { fontStylesOptionsMeta } from "../../../../../../media/fgTableText/lib/typeConstant";
import LazyFontButton from "../../../../../../media/fgTableText/lib/lowerTextControls/settingsButton/lib/LazyFontButton";

export default function FontStylePage({
  textMediaInstance,
  setRerender,
}: {
  textMediaInstance: React.MutableRefObject<TableTextMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectFontStyle = (fontStyle: string) => {
    staticContentEffectsStyles.current.text[
      textMediaInstance.current.textInstanceId
    ].fontStyle = fontStyle;

    if (textMediaInstance.current.settings.synced.value) {
      tableStaticContentSocket.current?.updateContentEffects(
        "text",
        textMediaInstance.current.textMedia.textId,
        textMediaInstance.current.textInstanceId,
        undefined,
        staticContentEffectsStyles.current.text[
          textMediaInstance.current.textInstanceId
        ],
      );
    }

    setRerender((prev) => !prev);
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar flex h-max max-h-[11.375rem] flex-col space-y-1 overflow-y-auto px-2"
        style={{ width: "calc(100% - 1rem)" }}
      >
        {Object.entries(fontStylesOptionsMeta).map(([key, meta]) => (
          <LazyFontButton
            key={key}
            scrollingContainerRef={scrollingContainerRef}
            item={
              <FgButton
                className={`${
                  staticContentEffectsStyles.current.text[
                    textMediaInstance.current.textInstanceId
                  ].fontStyle === meta.value
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                style={{
                  fontFamily: meta.value,
                }}
                contentFunction={() => (
                  <div className="truncate">{meta.title}</div>
                )}
                clickFunction={() => handleSelectFontStyle(meta.value)}
              />
            }
          />
        ))}
      </div>
    </>
  );
}
