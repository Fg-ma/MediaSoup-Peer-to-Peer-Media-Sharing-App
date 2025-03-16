class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    xid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    textId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, xid, n, m } = data;

    return {
      user_id: uid,
      textId: xid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
