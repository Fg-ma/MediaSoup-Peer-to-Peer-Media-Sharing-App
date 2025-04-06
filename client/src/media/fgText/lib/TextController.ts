class TextController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default TextController;
