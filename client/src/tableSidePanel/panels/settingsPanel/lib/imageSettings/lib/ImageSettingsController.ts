import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";

class ImageSettingsController {
  constructor(
    private imageMediaInstance: React.MutableRefObject<TableImageMediaInstance>,
    private setDownloadTypePageActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleSetAsBackground = () => {
    this.imageMediaInstance.current.settings.background.value =
      !this.imageMediaInstance.current.settings.background.value;

    this.imageMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.imageMediaInstance.current.settings.synced.value =
      !this.imageMediaInstance.current.settings.synced.value;

    this.setRerender((prev) => !prev);
  };

  handleDownloadTypePageActive = () => {
    this.setDownloadTypePageActive((prev) => !prev);
  };
}

export default ImageSettingsController;
