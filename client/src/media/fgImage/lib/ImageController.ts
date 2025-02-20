class ImageController {
  constructor(
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default ImageController;
