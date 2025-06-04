import { defaultSettings } from "./lib/typeConstant";

export type RemoteVisualMediaListenerTypes =
  | { type: "settingsChanged" }
  | { type: "toggleMiniPlayer" }
  | { type: "toggleClosedCaptions" };

class RemoteVisualMedia {
  settings = structuredClone(defaultSettings);

  private remoteVisualListeners: Set<
    (message: RemoteVisualMediaListenerTypes) => void
  > = new Set();

  constructor(
    public username: string,
    public instance: string,
    public visualMediaId: string,
    public type: "camera" | "screen",
    public track: MediaStreamTrack,
  ) {}

  deconstructor() {
    this.remoteVisualListeners.clear();
  }

  settingsChanged = () => {
    this.remoteVisualListeners.forEach((listener) => {
      listener({ type: "settingsChanged" });
    });
  };

  handleMiniPlayer = () => {
    this.remoteVisualListeners.forEach((listener) => {
      listener({ type: "toggleMiniPlayer" });
    });
  };

  handleClosedCaptions = () => {
    this.remoteVisualListeners.forEach((listener) => {
      listener({ type: "toggleClosedCaptions" });
    });
  };

  addRemoteVisualListener = (
    listener: (message: RemoteVisualMediaListenerTypes) => void,
  ): void => {
    this.remoteVisualListeners.add(listener);
  };

  removeRemoteVisualListener = (
    listener: (message: RemoteVisualMediaListenerTypes) => void,
  ): void => {
    this.remoteVisualListeners.delete(listener);
  };
}

export default RemoteVisualMedia;
