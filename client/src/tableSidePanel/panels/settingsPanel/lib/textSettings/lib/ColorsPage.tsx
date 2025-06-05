import React from "react";
import FgDropdownButton from "../../../../../../elements/fgDropdownButton/FgDropdownButton";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import { tableColorMap } from "../../../../../../table/lib/tableColors";
import ColorPickerButton from "../../../../../../elements/colorPickerButton/ColorPickerButton";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";
import { useEffectsContext } from "../../../../../../context/effectsContext/EffectsContext";
import {
  colorsOptionsTitles,
  ColorTypes,
} from "../../../../../../media/fgTableText/lib/typeConstant";

export default function ColorsPage({
  textMediaInstance,
  setRerender,
}: {
  textMediaInstance: React.MutableRefObject<TableTextMediaInstance>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentEffectsStyles } = useEffectsContext();
  const { tableStaticContentSocket } = useSocketContext();

  const handleSelectColor = (key: ColorTypes, color: string) => {
    staticContentEffectsStyles.current.text[
      textMediaInstance.current.textInstanceId
    ][key] = color;

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

  const handleInputColorChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: ColorTypes,
  ) => {
    const newColor = event.target.value?.trim();

    if (newColor && /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)) {
      staticContentEffectsStyles.current.text[
        textMediaInstance.current.textInstanceId
      ][key] = newColor.startsWith("#") ? newColor : `#${newColor}`;

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
    }
  };

  return (
    <>
      <div
        className="h-0.5 rounded-full bg-fg-red-light"
        style={{ width: "calc(100% - 1rem)" }}
      ></div>
      {Object.entries(colorsOptionsTitles).map(([key, title]) => (
        <div
          key={key}
          className="flex h-max flex-col items-center justify-center space-y-1"
          style={{ width: "calc(100% - 1rem)" }}
        >
          <FgDropdownButton
            className="h-max min-h-8 w-full !bg-fg-tone-black-6 text-lg"
            kind="popup"
            label={
              <div className="h-max min-h-7 w-[95%] overflow-x-hidden text-ellipsis whitespace-nowrap rounded font-K2D">
                {title}
              </div>
            }
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
                  textMediaInstance.current.textInstanceId
                ][key as ColorTypes]
              }
              handleAcceptColorCallback={(event) =>
                handleSelectColor(key as ColorTypes, event)
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
    </>
  );
}
