import React, { useRef } from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import {
  ActivePages,
  colorsOptionsTitles,
  ColorTypes,
} from "../../../typeConstant";
import FgDropdownButton from "../../../../../../elements/fgDropdownButton/FgDropdownButton";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import { tableColorMap } from "../../../../../../table/lib/tableColors";
import ColorPickerButton from "../../../../../../elements/colorPickerButton/ColorPickerButton";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../context/effectsContext/EffectsContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const navigateBackIcon = nginxAssetServerBaseUrl + "svgs/navigateBack.svg";

export default function ColorsPage({
  textMediaInstance,
  setActivePages,
  externalColorPickerPanelRefs,
  setRerender,
}: {
  textMediaInstance: TableTextMediaInstance;
  setActivePages: React.Dispatch<React.SetStateAction<ActivePages>>;
  externalColorPickerPanelRefs: {
    backgroundColor: React.RefObject<HTMLDivElement>;
    textColor: React.RefObject<HTMLDivElement>;
    indexColor: React.RefObject<HTMLDivElement>;
  };
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const scrollingContainerRef = useRef<HTMLDivElement>(null);

  const handleCloseColorsPage = () => {
    setActivePages((prev) => {
      const newActivePages = { ...prev };

      newActivePages.colors.active = !newActivePages.colors.active;

      return newActivePages;
    });
  };

  const handleSelectColor = (key: ColorTypes, color: string) => {
    staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId][
      key
    ] = color;

    tableStaticContentSocket.current?.updateContentEffects(
      "text",
      textMediaInstance.textMedia.textId,
      textMediaInstance.textInstanceId,
      undefined,
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId],
    );

    setRerender((prev) => !prev);
  };

  const handleInputColorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: ColorTypes,
  ) => {
    const newColor = event.target.value?.trim();

    if (newColor && /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)) {
      staticContentEffectsStyles.current.text[textMediaInstance.textInstanceId][
        key
      ] = newColor.startsWith("#") ? newColor : `#${newColor}`;

      tableStaticContentSocket.current?.updateContentEffects(
        "text",
        textMediaInstance.textMedia.textId,
        textMediaInstance.textInstanceId,
        undefined,
        staticContentEffectsStyles.current.text[
          textMediaInstance.textInstanceId
        ],
      );

      setRerender((prev) => !prev);
    }
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
          clickFunction={handleCloseColorsPage}
        />
        <div
          className="cursor-pointer pt-0.5 font-Josefin text-lg font-bold"
          onClick={handleCloseColorsPage}
        >
          Colors
        </div>
      </div>
      <div className="h-0.5 w-[95%] rounded-full bg-white bg-opacity-75"></div>
      <div
        ref={scrollingContainerRef}
        className="small-vertical-scroll-bar flex h-max max-h-[11.375rem] w-full flex-col space-y-4 overflow-y-auto px-2"
      >
        {Object.entries(colorsOptionsTitles).map(([key, title]) => (
          <div
            key={key}
            className="flex h-max w-full flex-col items-center justify-center space-y-1"
          >
            <FgDropdownButton
              className="h-max min-h-8 w-full text-lg"
              kind="popup"
              label={title}
              elements={Object.entries(tableColorMap).map(([color, info]) => (
                <div
                  key={color}
                  className="h-max w-[95%] rounded font-K2D hover:bg-fg-tone-black-8"
                  style={{ color: info.primary }}
                  data-text-settings-color={info.primary}
                  onPointerUp={() =>
                    handleSelectColor(key as ColorTypes, info.primary)
                  }
                >
                  {info.name}
                </div>
              ))}
            />
            <div className="flex h-max w-full items-center">
              <ColorPickerButton
                className="mr-1 h-7"
                defaultColor={
                  staticContentEffectsStyles.current.text[
                    textMediaInstance.textInstanceId
                  ][key as ColorTypes]
                }
                scrollingContainerRef={scrollingContainerRef}
                handleAcceptColorCallback={(event) =>
                  handleSelectColor(key as ColorTypes, event)
                }
                externalColorPickerPanelRef={
                  externalColorPickerPanelRefs[key as ColorTypes]
                }
              />
              <FgInput
                className="h-8 grow rounded-md border-2 text-lg"
                placeholder="color..."
                name="textSettingsColorInput"
                onChange={(event) =>
                  handleInputColorChange(event, key as ColorTypes)
                }
                options={{ submitButton: false }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
