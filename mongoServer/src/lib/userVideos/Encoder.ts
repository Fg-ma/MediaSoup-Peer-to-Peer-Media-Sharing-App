class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    videoId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    vid: string;
    n: string;
    m: string;
  } => {
    const { user_id, videoId, filename, mimeType } = data;

    return {
      uid: user_id,
      vid: videoId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
