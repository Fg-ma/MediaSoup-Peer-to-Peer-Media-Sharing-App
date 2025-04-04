class Encoder {
  constructor() {}

  encodeMetaData(data: {
    table_id: string;
    textId: string;
    filename: string;
    mimeType: string;
    tabled: boolean;
    instances: {
      textInstanceId: string;
      positioning: {
        position: { left: number; top: number };
        scale: { x: number; y: number };
        rotation: number;
      };
    }[];
  }): {
    tid: string;
    xid: string;
    n: string;
    m: string;
    t: boolean;
    i: {
      xiid: string;
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
    }[];
  } {
    const { table_id, textId, filename, mimeType, tabled, instances } = data;

    return {
      tid: table_id,
      xid: textId,
      n: filename,
      m: mimeType,
      t: tabled,
      i: instances.map(({ textInstanceId, positioning }) => ({
        xiid: textInstanceId,
        p: {
          p: { l: positioning.position.left, t: positioning.position.top },
          s: { x: positioning.scale.x, y: positioning.scale.y },
          r: positioning.rotation,
        },
      })),
    };
  }
}

export default Encoder;
