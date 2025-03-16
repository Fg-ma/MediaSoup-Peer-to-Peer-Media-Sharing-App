class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    imageId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    iid: string;
    n: string;
    m: string;
  } => {
    const { user_id, imageId, filename, mimeType } = data;

    return {
      uid: user_id,
      iid: imageId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
