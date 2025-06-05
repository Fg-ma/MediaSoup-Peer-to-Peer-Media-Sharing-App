import {
  IncomingTableStaticContentMessages,
  onRespondedCatchUpEffectsType,
  onUpdatedContentEffectsType,
} from "src/serverControllers/tableStaticContentServer/lib/typeConstant";
import { TextListenerTypes } from "../TableTextMedia";
import TableTextMediaInstance, {
  TextInstanceListenerTypes,
} from "../TableTextMediaInstance";
import {
  StaticContentEffectsStylesType,
  TextEffectStylesType,
} from "../../../../../universal/effectsTypeConstant";

class TextController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  private onDownloadComplete = () => {
    this.setRerender((prev) => !prev);
  };

  handleTextMessages = (event: TextListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      case "downloadFailed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadPaused":
        this.setRerender((prev) => !prev);
        break;
      case "downloadResumed":
        this.setRerender((prev) => !prev);
        break;
      case "downloadRetry":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  handleTextInstanceMessage = (msg: TextInstanceListenerTypes) => {
    switch (msg.type) {
      case "initialized":
        this.setRerender((prev) => !prev);
        break;
      case "settingsChanged":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  private onUpdatedContentEffects = (event: onUpdatedContentEffectsType) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effectStyles } = event.data;

    if (
      !this.textMediaInstance.settings.synced.value ||
      contentType !== "text" ||
      contentId !== this.textMediaInstance.textMedia.textId ||
      instanceId !== this.textMediaInstance.textInstanceId
    )
      return;

    if (effectStyles !== undefined) {
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.textInstanceId
      ] = effectStyles as TextEffectStylesType;
    }

    this.setRerender((prev) => !prev);
  };

  private onRespondedCatchUpEffects = (
    event: onRespondedCatchUpEffectsType,
  ) => {
    const { contentType, contentId, instanceId } = event.header;
    const { effectStyles } = event.data;

    if (
      contentType !== "text" ||
      contentId !== this.textMediaInstance.textMedia.textId ||
      instanceId !== this.textMediaInstance.textInstanceId
    )
      return;

    if (effectStyles)
      this.staticContentEffectsStyles.current.text[
        this.textMediaInstance.textInstanceId
      ] = effectStyles as TextEffectStylesType;

    this.textMediaInstance.settingsChanged();
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages,
  ) => {
    switch (event.type) {
      case "updatedContentEffects":
        this.onUpdatedContentEffects(event);
        break;
      case "respondedCatchUpEffects":
        this.onRespondedCatchUpEffects(event);
        break;
      default:
        break;
    }
  };
}

export default TextController;
