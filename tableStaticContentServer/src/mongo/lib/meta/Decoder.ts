class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    tid: string;
    tn: string;
    ow: string;
    mm: string[];
    p: string[];
    io: string[];
    bm: string | null;
    bi: string | null;
  }): {
    table_id: string;
    tableName: string;
    owner: string;
    members: string[];
    priority: string[];
    interactionOrder: string[];
    backgroundMedia: string | null;
    backgroundImage: string | null;
  } => {
    const { tid, tn, ow, mm, p, io, bm, bi } = data;

    return {
      table_id: tid,
      tableName: tn,
      owner: ow,
      members: mm,
      priority: p,
      interactionOrder: io,
      backgroundMedia: bm,
      backgroundImage: bi,
    };
  };
}

export default Decoder;
