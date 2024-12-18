class FgGameController {
  constructor(
    private setFocus: React.Dispatch<React.SetStateAction<boolean>>,
    private setFocusClicked: React.Dispatch<React.SetStateAction<boolean>>,
    private gameRef: React.RefObject<HTMLDivElement>,
    private closeCallback: (() => void) | undefined
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.closeCallback || event.target instanceof HTMLInputElement) return;

    const key = event.key.toLowerCase();
    if (["x", "delete", "escape"].includes(key)) {
      this.closeCallback();
    }
  };

  handleGameClick = (event: MouseEvent) => {
    if (this.gameRef.current) {
      const value = this.gameRef.current.contains(event.target as Node);
      this.setFocus(value);
      this.setFocusClicked(value);
    }
  };
}

export default FgGameController;
