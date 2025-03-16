class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    aid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    applicationId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, aid, n, m } = data;

    return {
      user_id: uid,
      applicationId: aid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
