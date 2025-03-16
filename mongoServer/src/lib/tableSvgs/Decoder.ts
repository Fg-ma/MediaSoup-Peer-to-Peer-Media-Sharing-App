class Decoder {
  constructor() {}

  decodeMetaData = (data: {
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
  }): {
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
  } => {
    const { tid, sid, n, m, p, v } = data;

    return {
      table_id: tid,
      svgId: sid,
      filename: n,
      mimeType: m,
      positioning: {
        position: {
          left: p.p.l,
          top: p.p.t,
        },
        scale: {
          x: p.s.x,
          y: p.s.y,
        },
        rotation: p.r,
      },
      visible: v,
    };
  };
}

export default Decoder;
