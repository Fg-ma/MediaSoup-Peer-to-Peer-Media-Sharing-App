class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    vid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    videoId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, vid, n, m } = data;

    return {
      user_id: uid,
      videoId: vid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
