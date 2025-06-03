import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";

class VideoSettingsController {
  constructor(
    private videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleSetAsBackground = () => {
    this.videoMediaInstance.current.settings.background.value =
      !this.videoMediaInstance.current.settings.background.value;

    this.videoMediaInstance.current.settingsChanged();

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.videoMediaInstance.current.settings.synced.value =
      !this.videoMediaInstance.current.settings.synced.value;

    this.setRerender((prev) => !prev);
  };
}

export default VideoSettingsController;
