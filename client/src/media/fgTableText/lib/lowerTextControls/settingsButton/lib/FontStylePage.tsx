import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import { ActivePages, fontStylesOptionsMeta } from "../../../typeConstant";
import LazyFontButton from "./LazyFontButton";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../context/effectsContext/EffectsContext";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function FontStylePage({
  textMediaInstance,
  setActivePages,
  setRerender,
}: {
  textMediaInstance: TableTextMediaInstance;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseFontStylePage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.fontStyle.active = !newActivePages.fontStyle.active;

      return newActivePages;
    });
  };

  const handleSelectFontStyle = (fontStyle: string) => {
    staticContentEffectsStyles.current.text[
      textMediaInstance.textInstanceId
    ].fontStyle = fontStyle;

    tableStaticContentSocket.current?.updateContentEffects(
      "text",
      textMediaInstance.textMedia.textId,
      textMediaInstance.textInstanceId,
      undefined,
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId],
    );

    setRerender((prev) => !prev);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
      <div className="flex h-6 w-full justify-start space-x-1">
        <FgButton
          className="aspect-square h-full"
          contentFunction={() => (
            <FgSVGElement
              src={navigateBackIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "#f2f2f2" },
                { key: "stroke", value: "#f2f2f2" },
              ]}
            />
          )}
          clickFunction={handleCloseFontStylePage}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleCloseFontStylePage}
        >
          Font styles
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-white bg-opacity-75"></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-1 overflow-y-auto px-2"
      >
        {Object.entries(fontStylesOptionsMeta).map(([key, meta]) => (
          <LazyFontButton
            key={key}
            scrollingContainerRef={scrollingContainerRef}
            item={
              <FgButton
                className={`${
                  staticContentEffectsStyles.current.text[
                    textMediaInstance.textInstanceId
                  ].fontStyle === meta.value
                    ? "bg-fg-white text-fg-tone-black-1"
                    : ""
                } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
                style={{
                  fontFamily: meta.value,
                }}
                contentFunction={() => <>{meta.title}</>}
                clickFunction={() => handleSelectFontStyle(meta.value)}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
