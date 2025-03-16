class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    soundClipId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    sid: string;
    n: string;
    m: string;
  } => {
    const { user_id, soundClipId, filename, mimeType } = data;

    return {
      uid: user_id,
      sid: soundClipId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
