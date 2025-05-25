import TableTextMedia from "./TableTextMedia";

class TableTextMediaInstance {
  private positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  constructor(
    public textMedia: TableTextMedia,
    public textInstanceId: string,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
  ) {
    this.positioning = this.initPositioning;
  }

  deconstructor = () => {};

  setPositioning = (positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }) => {
    this.positioning = positioning;
  };

  getPositioning = () => {
    return this.positioning;
  };
}

export default TableTextMediaInstance;
