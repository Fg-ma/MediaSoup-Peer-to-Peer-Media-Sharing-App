import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
    uid: string;
    vid: string;
    n: string;
    m: string;
    s: number[];
  }): {
    userId: string;
    videoId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  } => {
    const { uid, vid, n, m, s } = data;

    return {
      userId: uid,
      videoId: vid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => userStateDecodingMap[ate]),
    };
  };
}

export default Decoder;
