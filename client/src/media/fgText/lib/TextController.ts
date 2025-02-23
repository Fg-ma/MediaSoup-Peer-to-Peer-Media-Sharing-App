import TextMedia, { TextMediaEvents } from "../TextMedia";

class TextController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private text: React.MutableRefObject<string>,
    private textMedia: TextMedia
  ) {}

  handleTextMediaEvents = (event: TextMediaEvents) => {
    switch (event.type) {
      case "textFinishedLoading":
        if (this.textMedia.text) {
          this.text.current = this.textMedia.text;
          this.setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default TextController;
