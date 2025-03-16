class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
    positioning: {
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
    visible: boolean;
  }): {
    tid: string;
    sid: string;
    n: string;
    m: string;
    p: {
      p: {
        l: number;
        t: number;
      };
      s: {
        x: number;
        y: number;
      };
      r: number;
    };
    v: boolean;
  } => {
    const { table_id, svgId, filename, mimeType, positioning, visible } = data;

    return {
      tid: table_id,
      sid: svgId,
      n: filename,
      m: mimeType,
      p: {
        p: {
          l: positioning.position.left,
          t: positioning.position.top,
        },
        s: {
          x: positioning.scale.x,
          y: positioning.scale.y,
        },
        r: positioning.rotation,
      },
      v: visible,
    };
  };
}

export default Encoder;
