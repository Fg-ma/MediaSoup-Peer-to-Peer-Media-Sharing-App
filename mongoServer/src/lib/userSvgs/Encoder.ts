class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    svgId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    sid: string;
    n: string;
    m: string;
  } => {
    const { user_id, svgId, filename, mimeType } = data;

    return {
      uid: user_id,
      sid: svgId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
