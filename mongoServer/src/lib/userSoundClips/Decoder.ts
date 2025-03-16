class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    sid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, sid, n, m } = data;

    return {
      user_id: uid,
      soundClipId: sid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
