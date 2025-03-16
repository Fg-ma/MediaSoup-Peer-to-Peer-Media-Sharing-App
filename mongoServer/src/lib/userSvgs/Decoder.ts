class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    sid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, sid, n, m } = data;

    return {
      user_id: uid,
      svgId: sid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
