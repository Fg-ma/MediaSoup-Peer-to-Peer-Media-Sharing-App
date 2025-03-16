class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    iid: string;
    n: string;
    m: string;
  }): {
    user_id: string;
    imageId: string;
    filename: string;
    mimeType: string;
  } => {
    const { uid, iid, n, m } = data;

    return {
      user_id: uid,
      imageId: iid,
      filename: n,
      mimeType: m,
    };
  };
}

export default Decoder;
