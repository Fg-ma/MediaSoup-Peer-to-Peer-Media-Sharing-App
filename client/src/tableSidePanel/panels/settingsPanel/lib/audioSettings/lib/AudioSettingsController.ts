class AudioSettingsController {
  constructor(
    private svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>,
    private setDownloadOptionsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleSetAsBackground = () => {
    this.svgMediaInstance.current.settings.background.value =
      !this.svgMediaInstance.current.settings.background.value;

    this.svgMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleDownload = () => {
    this.svgMediaInstance.current.downloadSvg(
      this.svgMediaInstance.current.settings.downloadOptions.mimeType.value,
      this.svgMediaInstance.current.settings.downloadOptions.size.width.value,
      this.svgMediaInstance.current.settings.downloadOptions.size.height.value,
      this.svgMediaInstance.current.settings.downloadOptions.compression.value,
    );
  };

  handleCopyToClipBoard = () => {
    this.svgMediaInstance.current.copyToClipboard(
      this.svgMediaInstance.current.settings.downloadOptions.compression.value,
    );
  };

  handleDownloadOptionsActive = () => {
    this.setDownloadOptionsActive((prev) => !prev);
  };
}

export default AudioSettingsController;
