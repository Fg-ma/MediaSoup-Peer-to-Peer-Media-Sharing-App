class FgTableController {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableRef: React.RefObject<HTMLDivElement>,
    private aspectDir: React.MutableRefObject<"width" | "height">
  ) {}

  getAspectDir = () => {
    if (!this.tableRef.current) {
      return;
    }

    if (
      this.tableRef.current.clientWidth >= this.tableRef.current.clientHeight
    ) {
      if (this.aspectDir.current !== "width") {
        this.aspectDir.current = "width";
        this.setRerender((prev) => !prev);
      }
    } else {
      if (this.aspectDir.current !== "height") {
        this.aspectDir.current = "height";
        this.setRerender((prev) => !prev);
      }
    }
  };
}

export default FgTableController;
