import { TextOptions } from "./typeConstant";

class TextController {
  constructor(
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private textOptions: TextOptions,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.textContainerRef.current?.style.setProperty(
      "--primary-text-color",
      `${this.textOptions.primaryTextColor}`
    );
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default TextController;
