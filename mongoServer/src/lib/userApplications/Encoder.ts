class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    user_id: string;
    applicationId: string;
    filename: string;
    mimeType: string;
  }): {
    uid: string;
    aid: string;
    n: string;
    m: string;
  } => {
    const { user_id, applicationId, filename, mimeType } = data;

    return {
      uid: user_id,
      aid: applicationId,
      n: filename,
      m: mimeType,
    };
  };
}

export default Encoder;
