class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    textId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    xid: string;
    n: string;
    m: string;
  } => {
    const { user_id, textId, filename, mimeType } = data;

    return {
      uid: user_id,
      xid: textId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
