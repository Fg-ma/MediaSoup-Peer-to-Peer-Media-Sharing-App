class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    table_id: string;
    tableName: string;
    owner: string;
    members: string[];
    priority: string[];
    interactionOrder: string[];
    backgroundMedia: string | null;
    backgroundImage: string | null;
  }): {
    tid: string;
    tn: string;
    ow: string;
    mm: string[];
    p: string[];
    io: string[];
    bm: string | null;
    bi: string | null;
  } => {
    const {
      table_id,
      tableName,
      owner,
      members,
      priority,
      interactionOrder,
      backgroundMedia,
      backgroundImage,
    } = data;

    return {
      tid: table_id,
      tn: tableName,
      ow: owner,
      mm: members,
      p: priority,
      io: interactionOrder,
      bm: backgroundMedia,
      bi: backgroundImage,
    };
  };
}

export default Encoder;
