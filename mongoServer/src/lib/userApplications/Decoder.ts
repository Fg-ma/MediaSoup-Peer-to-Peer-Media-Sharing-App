import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetadata = (data: {
    uid: string;
    aid: string;
    n: string;
    m: string;
    s: number[];
  }): {
    userId: string;
    applicationId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  } => {
    const { uid, aid, n, m, s } = data;

    return {
      userId: uid,
      applicationId: aid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => userStateDecodingMap[ate]),
    };
  };
}

export default Decoder;
