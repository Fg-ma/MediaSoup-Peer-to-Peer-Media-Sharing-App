class FgGameController {
  constructor(
    private setFocus: React.Dispatch<React.SetStateAction<boolean>>,
    private setFocusClicked: React.Dispatch<React.SetStateAction<boolean>>,
    private gameRef: React.RefObject<HTMLDivElement>,
    private closeGameFunction: (() => void) | undefined,
    private startGameFunction: (() => void) | undefined
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (!focus || event.target instanceof HTMLInputElement) return;

    switch (event.key.toLowerCase()) {
      case "p":
        if (this.startGameFunction) {
          this.startGameFunction();
        }
        break;
      case "x":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "delete":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      case "escape":
        if (this.closeGameFunction) {
          this.closeGameFunction();
        }
        break;
      default:
        break;
    }
  };

  handleGameClick = (event: React.MouseEvent) => {
    if (this.gameRef.current) {
      const value = this.gameRef.current.contains(event.target as Node);
      this.setFocus(value);
      this.setFocusClicked(value);
    }
  };
}

export default FgGameController;
