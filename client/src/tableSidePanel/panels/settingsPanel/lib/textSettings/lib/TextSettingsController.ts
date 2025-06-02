import TableStaticContentSocketController from "../../../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableTextMediaInstance from "../../../../../../media/fgTableText/TableTextMediaInstance";
import {
  defaultTextEffectsStyles,
  StaticContentEffectsStylesType,
} from "../../../../../../../../universal/effectsTypeConstant";
import { defaultSettings } from "../../../../../../media/fgTableText/lib/typeConstant";

class TextSettingsController {
  constructor(
    private textMediaInstance: React.MutableRefObject<TableTextMediaInstance>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleDownload = () => {
    this.textMediaInstance.current.textMedia.downloadText();
  };

  handleSetAsBackground = () => {
    this.textMediaInstance.current.settings.background.value =
      !this.textMediaInstance.current.settings.background.value;

    this.textMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.textMediaInstance.current.settings.synced.value =
      !this.textMediaInstance.current.settings.synced.value;

    this.textMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleEdit = () => {
    this.textMediaInstance.current.isReadOnly =
      !this.textMediaInstance.current.isReadOnly;

    this.textMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleMinimap = () => {
    this.textMediaInstance.current.settings.minimap.value =
      !this.textMediaInstance.current.settings.minimap.value;

    this.textMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleFontSizeChange = (
    type: "increment" | "decrement" | "value",
    value: number,
  ) => {
    const effectStyles =
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.current.textInstanceId
      ];
    const currentValue = parseInt(effectStyles.fontSize.slice(0, -2));

    if (type === "increment") {
      effectStyles.fontSize = `${currentValue + value}px`;
    } else if (type === "decrement") {
      effectStyles.fontSize = `${Math.max(1, currentValue - value)}px`;
    } else {
      effectStyles.fontSize = `${Math.max(1, value)}px`;
    }

    this.tableStaticContentSocket.current?.updateContentEffects(
      "text",
      this.textMediaInstance.current.textMedia.textId,
      this.textMediaInstance.current.textInstanceId,
      undefined,
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.current.textInstanceId
      ],
    );

    this.setRerender((prev) => !prev);
  };

  handleLetterSpacingChange = (
    type: "increment" | "decrement" | "value",
    value: number,
  ) => {
    const effectStyles =
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.current.textInstanceId
      ];
    const currentValue = effectStyles.letterSpacing;

    if (type === "increment") {
      effectStyles.letterSpacing = Math.min(20, currentValue + value);
    } else if (type === "decrement") {
      effectStyles.letterSpacing = Math.max(-5, currentValue - value);
    } else {
      effectStyles.letterSpacing = Math.min(20, Math.max(-5, value));
    }

    this.tableStaticContentSocket.current?.updateContentEffects(
      "text",
      this.textMediaInstance.current.textMedia.textId,
      this.textMediaInstance.current.textInstanceId,
      undefined,
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.current.textInstanceId
      ],
    );

    this.setRerender((prev) => !prev);
  };

  handleResetAll = () => {
    this.textMediaInstance.current.settings = structuredClone(defaultSettings);

    this.textMediaInstance.current.settingsChanged();

    this.staticContentEffectsStyles.current.text[
      this.textMediaInstance.current.textInstanceId
    ] = structuredClone(defaultTextEffectsStyles);

    this.tableStaticContentSocket.current?.updateContentEffects(
      "text",
      this.textMediaInstance.current.textMedia.textId,
      this.textMediaInstance.current.textInstanceId,
      undefined,
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.current.textInstanceId
      ],
    );

    this.setRerender((prev) => !prev);
  };
}

export default TextSettingsController;
