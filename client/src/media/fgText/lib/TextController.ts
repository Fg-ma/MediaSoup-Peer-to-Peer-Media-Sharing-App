import { TextMediaEvents } from "../TextMedia";

class TextController {
  constructor(
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
}

export default TextController;
