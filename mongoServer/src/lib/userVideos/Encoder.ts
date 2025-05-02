import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateEncodingMap } from "../typeConstant";

class Encoder {
  constructor() {}

  encodeMetaData = (data: {
    userId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  }): {
    uid: string;
    vid: string;
    n: string;
    m: string;
    s: number[];
  } => {
    const { userId, videoId, filename, mimeType, state } = data;

    return {
      uid: userId,
      vid: videoId,
      n: filename,
      m: mimeType,
      s: state.map((ate) => userStateEncodingMap[ate]),
    };
  };
}

export default Encoder;
