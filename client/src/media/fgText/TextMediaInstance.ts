import { StaticContentTypes } from "../../../../universal/typeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import TextMedia from "./TextMedia";

export type TextMediaEvents = onTextFinishedLoadingType;

export type onTextFinishedLoadingType = {
  type: "textFinishedLoading";
};

class TextMediaInstance extends TextMedia {
  instanceText: undefined | string;

  constructor(
    textId: string,
    public textInstanceId: string,
    filename: string,
    mimeType: TableTopStaticMimeType,
    tabled: boolean,
    getText: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string
    ) => void,
    addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }
  ) {
    super(
      textId,
      filename,
      mimeType,
      tabled,
      getText,
      addMessageListener,
      removeMessageListener
    );

    if (TextMedia.textCache.has(this.textId)) {
      this.instanceText = TextMedia.textCache.get(this.textId);
    }
    this.addListener((event) => {
      if (event.type === "textFinishedLoading")
        this.instanceText = TextMedia.textCache.get(this.textId);
    });
  }

  deconstructor = () => {};
}

export default TextMediaInstance;
