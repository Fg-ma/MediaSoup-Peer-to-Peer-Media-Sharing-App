import { ApplicationOptions } from "./typeConstant";

class ApplicationController {
  constructor(
    private applicationContainerRef: React.RefObject<HTMLDivElement>,
    private applicationOptions: ApplicationOptions,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.applicationContainerRef.current?.style.setProperty(
      "--primary-application-color",
      `${this.applicationOptions.primaryApplicationColor}`
    );
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };
}

export default ApplicationController;
