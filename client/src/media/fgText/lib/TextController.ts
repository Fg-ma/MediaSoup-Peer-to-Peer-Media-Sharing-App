import { TextMediaEvents } from "../TextMedia";

class TextController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTextMediaEvents = (event: TextMediaEvents) => {
    switch (event.type) {
      case "textFinishedLoading":
        this.setRerender((prev) => !prev);
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
