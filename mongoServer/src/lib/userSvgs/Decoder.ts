import { UserContentStateTypes } from "../../../../universal/contentTypeConstant";
import { userStateDecodingMap } from "../typeConstant";

class Decoder {
  constructor() {}

  decodeMetaData = (data: {
    uid: string;
    sid: string;
    n: string;
    m: string;
    s: number[];
  }): {
    userId: string;
    svgId: string;
    filename: string;
    mimeType: string;
    state: UserContentStateTypes[];
  } => {
    const { uid, sid, n, m, s } = data;

    return {
      userId: uid,
      svgId: sid,
      filename: n,
      mimeType: m,
      state: s.map((ate) => userStateDecodingMap[ate]),
    };
  };
}

export default Decoder;
